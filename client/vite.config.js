import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 🛡️ Rate Limiting simple pour le développement
class SimpleRateLimiter {
  constructor() {
    this.requests = new Map(); // IP -> { count, resetTime }
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 100; // 100 requêtes par fenêtre
    
    // Nettoyage périodique des anciennes entrées
    setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of this.requests.entries()) {
        if (now > data.resetTime) {
          this.requests.delete(ip);
        }
      }
    }, 5 * 60 * 1000); // Nettoyage toutes les 5 minutes
  }

  isAllowed(clientIP) {
    const now = Date.now();
    const clientData = this.requests.get(clientIP);

    if (!clientData || now > clientData.resetTime) {
      // Nouvelle fenêtre ou nouveau client
      this.requests.set(clientIP, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    if (clientData.count >= this.maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      };
    }

    clientData.count++;
    return { 
      allowed: true, 
      remaining: this.maxRequests - clientData.count 
    };
  }
}

const rateLimiter = new SimpleRateLimiter();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 🌐 Configuration existante conservée
    allowedHosts: ["http://localhost:5173", "localhost"],
    
    // 🛡️ Middleware personnalisé pour rate limiting et sécurité
    middlewares: [
      // Rate Limiting Middleware
      (req, res, next) => {
        // Extraction de l'IP (compatibilité IPv4/IPv6)
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress ||
                        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                        '127.0.0.1';

        // Normalisation IPv6 vers IPv4 si possible
        const normalizedIP = clientIP.replace('::ffff:', '');
        
        const rateCheck = rateLimiter.isAllowed(normalizedIP);

        // Headers de rate limiting
        res.setHeader('X-RateLimit-Limit', '100');
        res.setHeader('X-RateLimit-Remaining', rateCheck.remaining.toString());
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 15 * 60 * 1000).toISOString());

        if (!rateCheck.allowed) {
          console.warn(`🚨 Rate limit dépassé pour IP: ${normalizedIP}`);
          res.setHeader('Retry-After', rateCheck.retryAfter.toString());
          res.status(429).json({
            success: false,
            error: 'Trop de requêtes, réessayez dans quelques minutes',
            retryAfter: rateCheck.retryAfter
          });
          return;
        }

        // Log des requêtes suspectes
        if (rateCheck.remaining < 10) {
          console.warn(`⚠️ Approche de la limite pour IP: ${normalizedIP} (${rateCheck.remaining} restantes)`);
        }

        next();
      },

      // Security Headers Middleware
      (req, res, next) => {
        // HSTS pour HTTPS (même en dev si on utilise https://localhost)
        if (req.headers['x-forwarded-proto'] === 'https' || req.secure) {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Protection supplémentaire contre l'exposition de fichiers sensibles
        const forbiddenPaths = [
          '/.env', '/config.php', '/wp-config.php', '/database.yml',
          '/app.config', '/.git/', '/backup.sql', '/phpinfo.php',
          '/server-status', '/debug', '/.htaccess', '/composer.json'
        ];

        if (forbiddenPaths.some(path => req.url.startsWith(path))) {
          console.warn(`🚨 Tentative d'accès fichier sensible: ${req.url} depuis ${req.connection.remoteAddress}`);
          res.status(404).json({ 
            success: false,
            error: 'Not Found' 
          });
          return;
        }

        // Protection contre les attaques par User-Agent malveillant
        const userAgent = req.headers['user-agent'] || '';
        const suspiciousPatterns = [
          /sqlmap/i, /nikto/i, /nessus/i, /masscan/i, 
          /nmap/i, /dirb/i, /dirbuster/i, /gobuster/i
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
          console.error(`🚨 User-Agent suspect détecté: ${userAgent} depuis ${req.connection.remoteAddress}`);
          res.status(403).json({
            success: false,
            error: 'Access Denied'
          });
          return;
        }

        next();
      }
    ],
    
    // 🛡️ Headers de sécurité ajoutés (configuration existante améliorée)
    headers: {
      // Empêche le MIME sniffing
      'X-Content-Type-Options': 'nosniff',
      // Empêche l'intégration dans des iframes (protection clickjacking)
      'X-Frame-Options': 'DENY',
      // Active la protection XSS du navigateur
      'X-XSS-Protection': '1; mode=block',
      // Contrôle les informations referrer
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Politique de sécurité du contenu adaptée pour Vite + votre setup
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval nécessaire pour Vite HMR
        "style-src 'self' 'unsafe-inline' https:",
        "img-src 'self' data: https:",
        "font-src 'self' https:",
        // Connexions autorisées vers vos backends
        "connect-src 'self' ws: wss: http://localhost:5173 http://localhost:3001"
      ].join('; '),
      // Désactive les fonctionnalités du navigateur potentiellement dangereuses
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      // Cache control pour le développement
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      // Headers supplémentaires de sécurité
      'X-Permitted-Cross-Domain-Policies': 'none',
      'X-Download-Options': 'noopen',
      // Rate limiting info dans les headers
      'X-RateLimit-Policy': '100 requests per 15 minutes'
    },
    
    // 🔄 Configuration proxy existante conservée
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        // 📝 Log optionnel pour debug (vous pouvez le retirer)
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`🔄 Proxy API: ${req.method} ${req.url} -> localhost${req.url}`);
          });
          
          // Log des erreurs de proxy
          proxy.on('error', (err, req, res) => {
            console.error(`🚨 Erreur Proxy: ${err.message} pour ${req.url}`);
          });
        }
      },
    },
  },
  
  // 🏗️ Configuration pour le build de production
  build: {
    outDir: 'dist',
    sourcemap: false, // Pas de sourcemaps en production pour la sécurité
    minify: 'terser',
    rollupOptions: {
      output: {
        // Chunking pour un meilleur cache
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  
  // 🔧 Configuration supplémentaire pour la sécurité
  define: {
    // Empêche l'exposition d'informations sensibles
    __DEV__: JSON.stringify(false),
  },
  
  // 🛡️ Optimisations de sécurité
  optimizeDeps: {
    // Force l'inclusion des dépendances critiques
    include: ['react', 'react-dom', 'react-router-dom']
  }
});