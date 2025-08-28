import React, { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Eye, Type, Palette, Volume2, Keyboard, Contrast, Glasses, Hand, Mouse, Maximize, X, RotateCcw, Sun, Moon,Zap,
  Focus,
  Timer,
  Pause,
  Play,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Target,
  Navigation
} from "lucide-react";
import '../styles/AccessibilityMenu.css'

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vision");
  const menuRef = useRef(null);
  const toggleButtonRef = useRef(null);
  
  const [settings, setSettings] = useState({
    // Vision
    contrast: "normal",
    colorBlind: "none",
    fontSize: 100,
    lineHeight: 1.5,
    letterSpacing: 0,
    darkMode: false,
    
    // Lecture
    dyslexia: false,
    readingGuide: false,
    highlightLinks: false,
    
    // Audio
    audioEnabled: false,
    speechRate: 0.8,
    speechVolume: 1.0,
    autoRead: false,
    
    // Navigation
    largeCursor: false,
    reduceMotion: false,
    focusHighlight: true,
    keyboardNavigation: true,
    stickyFocus: false,
    
    // Interaction
    clickDelay: 0,
    hoverDelay: 200,
    tooltipsEnabled: true,
    confirmActions: false
  });

  // Appliquer les paramètres au DOM
  const applySettings = useCallback(() => {
    const body = document.body;
    const root = document.documentElement;
    
    // Nettoyer les classes existantes
    body.classList.remove(
      "high-contrast", "dark-mode", "dyslexia-mode", "reduce-motion", 
      "large-cursor", "reading-guide", "highlight-links", "focus-enhanced",
      "colorblind-protanopia", "colorblind-deuteranopia", "colorblind-tritanopia", 
      "colorblind-monochrome", "sticky-focus"
    );

    // Appliquer les nouveaux paramètres
    if (settings.contrast === "high") body.classList.add("high-contrast");
    if (settings.darkMode) body.classList.add("dark-mode");
    if (settings.colorBlind !== "none") body.classList.add(`colorblind-${settings.colorBlind}`);
    if (settings.dyslexia) body.classList.add("dyslexia-mode");
    if (settings.reduceMotion) body.classList.add("reduce-motion");
    if (settings.largeCursor) body.classList.add("large-cursor");
    if (settings.readingGuide) body.classList.add("reading-guide");
    if (settings.highlightLinks) body.classList.add("highlight-links");
    if (settings.focusHighlight) body.classList.add("focus-enhanced");
    if (settings.stickyFocus) body.classList.add("sticky-focus");
    
    // Variables CSS personnalisées
    root.style.setProperty('--font-size-scale', `${settings.fontSize}%`);
    root.style.setProperty('--line-height', settings.lineHeight);
    root.style.setProperty('--letter-spacing', `${settings.letterSpacing}px`);
    root.style.setProperty('--hover-delay', `${settings.hoverDelay}ms`);
  }, [settings]);

  useEffect(() => {
    applySettings();
  }, [settings, applySettings]);

  // Synthèse vocale améliorée
  const speak = useCallback((text, interrupt = true) => {
    if (!settings.audioEnabled || !text) return;
    
    if (interrupt) window.speechSynthesis.cancel();
    
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = settings.speechRate;
    utterance.volume = settings.speechVolume;
    utterance.pitch = 1;
    
    utterance.onerror = (event) => {
      console.warn("Erreur synthèse vocale:", event.error);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [settings.audioEnabled, settings.speechRate, settings.speechVolume]);

  // Raccourcis clavier étendus
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        setIsOpen(prev => {
          const newState = !prev;
          speak(newState ? "Menu d'accessibilité ouvert" : "Menu d'accessibilité fermé");
          return newState;
        });
      }
      
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        setSettings(prev => {
          const newContrast = prev.contrast === "normal" ? "high" : "normal";
          speak(`Contraste ${newContrast === "high" ? "élevé" : "normal"} activé`);
          return { ...prev, contrast: newContrast };
        });
      }
      
      if (e.altKey && e.key === "d") {
        e.preventDefault();
        setSettings(prev => {
          const newDyslexia = !prev.dyslexia;
          speak(`Mode dyslexie ${newDyslexia ? "activé" : "désactivé"}`);
          return { ...prev, dyslexia: newDyslexia };
        });
      }
      
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        setSettings(prev => {
          const newAudio = !prev.audioEnabled;
          speak(`Synthèse vocale ${newAudio ? "activée" : "désactivée"}`);
          return { ...prev, audioEnabled: newAudio };
        });
      }
      
      if (e.altKey && e.key === "m") {
        e.preventDefault();
        setSettings(prev => {
          const newDarkMode = !prev.darkMode;
          speak(`Mode ${newDarkMode ? "sombre" : "clair"} activé`);
          return { ...prev, darkMode: newDarkMode };
        });
      }
      
      if (e.altKey && e.key === "+") {
        e.preventDefault();
        setSettings(prev => {
          const newSize = Math.min(prev.fontSize + 10, 200);
          speak(`Taille de police ${newSize}%`);
          return { ...prev, fontSize: newSize };
        });
      }
      
      if (e.altKey && e.key === "-") {
        e.preventDefault();
        setSettings(prev => {
          const newSize = Math.max(prev.fontSize - 10, 50);
          speak(`Taille de police ${newSize}%`);
          return { ...prev, fontSize: newSize };
        });
      }
      
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        speak("Menu fermé");
        toggleButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, speak]);

  // Lecture automatique au survol
  useEffect(() => {
    if (!settings.audioEnabled || !settings.autoRead) return;
    
    let currentTimeout;
    
    const handleMouseEnter = (e) => {
      const element = e.target;
      
      if (['SCRIPT', 'STYLE', 'META', 'LINK'].includes(element.tagName)) return;
      
      const text = element.textContent?.trim() || 
                  element.alt || 
                  element.placeholder || 
                  element.title ||
                  element.getAttribute('aria-label');
      
      if (text && text.length > 2 && text.length < 500) {
        currentTimeout = setTimeout(() => {
          speak(text, false);
        }, settings.hoverDelay);
      }
    };
    
    const handleMouseLeave = () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
    };
    
    document.addEventListener("mouseenter", handleMouseEnter, { capture: true });
    document.addEventListener("mouseleave", handleMouseLeave, { capture: true });
    
    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter, { capture: true });
      document.removeEventListener("mouseleave", handleMouseLeave, { capture: true });
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [settings.audioEnabled, settings.autoRead, settings.hoverDelay, speak]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector('button:not(.accessibility-close)');
      firstFocusable?.focus();
    }
  }, [isOpen, activeTab]);

  const resetSettings = () => {
    const defaultSettings = {
      contrast: "normal",
      colorBlind: "none",
      fontSize: 100,
      lineHeight: 1.5,
      letterSpacing: 0,
      darkMode: false,
      dyslexia: false,
      readingGuide: false,
      highlightLinks: false,
      audioEnabled: false,
      speechRate: 0.8,
      speechVolume: 1.0,
      autoRead: false,
      largeCursor: false,
      reduceMotion: false,
      focusHighlight: true,
      keyboardNavigation: true,
      stickyFocus: false,
      clickDelay: 0,
      hoverDelay: 200,
      tooltipsEnabled: true,
      confirmActions: false
    };
    setSettings(defaultSettings);
    speak("Paramètres d'accessibilité réinitialisés");
  };

  const tabs = [
    { id: "vision", label: "Vision", icon: Eye },
    { id: "reading", label: "Lecture", icon: Glasses },
    { id: "audio", label: "Audio", icon: Volume2 },
    { id: "navigation", label: "Navigation", icon: Navigation },
    { id: "interaction", label: "Interaction", icon: Target }
  ];

  const ToggleButton = ({ active, onClick, children, ariaLabel, ariaPressed, icon: Icon }) => (
    <button
      className={`accessibility-toggle-control ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      onMouseEnter={() => settings.audioEnabled && speak(ariaLabel, false)}
    >
      <div className="control-icon">
        {Icon && <Icon size={18} />}
      </div>
      <span className="control-label">{children}</span>
      <span className="control-status">
        {active ? 'ON' : 'OFF'}
      </span>
    </button>
  );

  const SliderControl = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = "", icon: Icon }) => (
    <div className="accessibility-slider-control">
      <label className="accessibility-slider-label">
        {Icon && <Icon size={16} />}
        {label}: <span className="accessibility-slider-value">{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value);
          onChange(newValue);
          speak(`${label} ${newValue}${unit}`, false);
        }}
        className="accessibility-slider"
      />
      <div className="accessibility-slider-range">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "vision":
        return (
          <div className="accessibility-tab-content">
            <ToggleButton
              active={settings.contrast === "high"}
              onClick={() => setSettings(prev => ({ 
                ...prev, 
                contrast: prev.contrast === "normal" ? "high" : "normal" 
              }))}
              ariaLabel="Contraste élevé"
              ariaPressed={settings.contrast === "high"}
              icon={Contrast}
            >
              Contraste élevé
            </ToggleButton>

            <ToggleButton
              active={settings.darkMode}
              onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
              ariaLabel="Mode sombre"
              ariaPressed={settings.darkMode}
              icon={settings.darkMode ? Moon : Sun}
            >
              Mode sombre
            </ToggleButton>

            <div className="accessibility-select-control">
              <label className="accessibility-slider-label">
                <Palette size={16} />
                Mode daltonien
              </label>
              <select
                value={settings.colorBlind}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, colorBlind: e.target.value }));
                  speak(`Mode daltonien: ${e.target.value === "none" ? "désactivé" : e.target.value}`);
                }}
                className="accessibility-select"
              >
                <option value="none">Aucun</option>
                <option value="protanopia">Protanopie (rouge-vert)</option>
                <option value="deuteranopia">Deutéranopie (vert-rouge)</option>
                <option value="tritanopia">Tritanopie (bleu-jaune)</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>

            <SliderControl
              label="Taille de police"
              value={settings.fontSize}
              onChange={(value) => setSettings(prev => ({ ...prev, fontSize: value }))}
              min={50}
              max={200}
              step={10}
              unit="%"
              icon={Type}
            />

            <SliderControl
              label="Interligne"
              value={settings.lineHeight}
              onChange={(value) => setSettings(prev => ({ ...prev, lineHeight: value }))}
              min={1}
              max={3}
              step={0.1}
              icon={Type}
            />

            <SliderControl
              label="Espacement des lettres"
              value={settings.letterSpacing}
              onChange={(value) => setSettings(prev => ({ ...prev, letterSpacing: value }))}
              min={-2}
              max={5}
              step={0.5}
              unit="px"
              icon={Type}
            />
          </div>
        );

      case "reading":
        return (
          <div className="accessibility-tab-content">
            <ToggleButton
              active={settings.dyslexia}
              onClick={() => setSettings(prev => ({ ...prev, dyslexia: !prev.dyslexia }))}
              ariaLabel="Mode dyslexie"
              ariaPressed={settings.dyslexia}
              icon={Glasses}
            >
              Police dyslexie
            </ToggleButton>

            <ToggleButton
              active={settings.readingGuide}
              onClick={() => setSettings(prev => ({ ...prev, readingGuide: !prev.readingGuide }))}
              ariaLabel="Guide de lecture"
              ariaPressed={settings.readingGuide}
              icon={Focus}
            >
              Guide de lecture
            </ToggleButton>

            <ToggleButton
              active={settings.highlightLinks}
              onClick={() => setSettings(prev => ({ ...prev, highlightLinks: !prev.highlightLinks }))}
              ariaLabel="Surligner les liens"
              ariaPressed={settings.highlightLinks}
              icon={Target}
            >
              Surligner les liens
            </ToggleButton>
          </div>
        );

      case "audio":
        return (
          <div className="accessibility-tab-content">
            <ToggleButton
              active={settings.audioEnabled}
              onClick={() => setSettings(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
              ariaLabel="Synthèse vocale"
              ariaPressed={settings.audioEnabled}
              icon={settings.audioEnabled ? Volume2 : VolumeX}
            >
              Synthèse vocale
            </ToggleButton>

            {settings.audioEnabled && (
              <>
                <ToggleButton
                  active={settings.autoRead}
                  onClick={() => setSettings(prev => ({ ...prev, autoRead: !prev.autoRead }))}
                  ariaLabel="Lecture automatique au survol"
                  ariaPressed={settings.autoRead}
                  icon={settings.autoRead ? Play : Pause}
                >
                  Lecture au survol
                </ToggleButton>

                <SliderControl
                  label="Vitesse de lecture"
                  value={Math.round(settings.speechRate * 100)}
                  onChange={(value) => setSettings(prev => ({ ...prev, speechRate: value / 100 }))}
                  min={50}
                  max={200}
                  step={10}
                  unit="%"
                  icon={Zap}
                />

                <SliderControl
                  label="Volume"
                  value={Math.round(settings.speechVolume * 100)}
                  onChange={(value) => setSettings(prev => ({ ...prev, speechVolume: value / 100 }))}
                  min={0}
                  max={100}
                  step={10}
                  unit="%"
                  icon={Volume2}
                />

                <SliderControl
                  label="Délai survol"
                  value={settings.hoverDelay}
                  onChange={(value) => setSettings(prev => ({ ...prev, hoverDelay: value }))}
                  min={0}
                  max={1000}
                  step={100}
                  unit="ms"
                  icon={Timer}
                />
              </>
            )}
          </div>
        );

      case "navigation":
        return (
          <div className="accessibility-tab-content">
            <ToggleButton
              active={settings.largeCursor}
              onClick={() => setSettings(prev => ({ ...prev, largeCursor: !prev.largeCursor }))}
              ariaLabel="Grand curseur"
              ariaPressed={settings.largeCursor}
              icon={Mouse}
            >
              Grand curseur
            </ToggleButton>

            <ToggleButton
              active={settings.reduceMotion}
              onClick={() => setSettings(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }))}
              ariaLabel="Réduire les animations"
              ariaPressed={settings.reduceMotion}
              icon={Hand}
            >
              Réduire les animations
            </ToggleButton>

            <ToggleButton
              active={settings.focusHighlight}
              onClick={() => setSettings(prev => ({ ...prev, focusHighlight: !prev.focusHighlight }))}
              ariaLabel="Améliorer le focus"
              ariaPressed={settings.focusHighlight}
              icon={Target}
            >
              Focus amélioré
            </ToggleButton>

            <ToggleButton
              active={settings.stickyFocus}
              onClick={() => setSettings(prev => ({ ...prev, stickyFocus: !prev.stickyFocus }))}
              ariaLabel="Focus persistant"
              ariaPressed={settings.stickyFocus}
              icon={Focus}
            >
              Focus persistant
            </ToggleButton>
          </div>
        );

      case "interaction":
        return (
          <div className="accessibility-tab-content">
            <ToggleButton
              active={settings.tooltipsEnabled}
              onClick={() => setSettings(prev => ({ ...prev, tooltipsEnabled: !prev.tooltipsEnabled }))}
              ariaLabel="Info-bulles"
              ariaPressed={settings.tooltipsEnabled}
              icon={Eye}
            >
              Info-bulles
            </ToggleButton>

            <ToggleButton
              active={settings.confirmActions}
              onClick={() => setSettings(prev => ({ ...prev, confirmActions: !prev.confirmActions }))}
              ariaLabel="Confirmer les actions"
              ariaPressed={settings.confirmActions}
              icon={Target}
            >
              Confirmer les actions
            </ToggleButton>

            <SliderControl
              label="Délai de clic"
              value={settings.clickDelay}
              onChange={(value) => setSettings(prev => ({ ...prev, clickDelay: value }))}
              min={0}
              max={1000}
              step={50}
              unit="ms"
              icon={Timer}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Bouton d'ouverture du menu */}
      <button
        ref={toggleButtonRef}
        className="accessibility-toggle"
        onClick={() => {
          setIsOpen(!isOpen);
          speak(isOpen ? "Fermeture du menu" : "Ouverture du menu d'accessibilité");
        }}
        aria-label="Menu d'accessibilité"
        aria-expanded={isOpen}
        title="Ouvrir le menu d'accessibilité (Alt+A)"
      >
        <Settings size={24} />
        <span className="sr-only">Accessibilité</span>
      </button>

      {/* Menu d'accessibilité */}
      {isOpen && (
        <div
          ref={menuRef}
          className="accessibility-menu"
          role="dialog"
          aria-label="Paramètres d'accessibilité"
        >
          {/* En-tête */}
          <div className="accessibility-header">
            <h2 className="accessibility-title">
              <Settings size={20} />
              Accessibilité
            </h2>
            <button
              onClick={() => {
                setIsOpen(false);
                speak("Menu fermé");
              }}
              className="accessibility-close"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Onglets */}
          <div className="accessibility-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`accessibility-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    speak(`Onglet ${tab.label}`);
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenu des onglets */}
          <div className="accessibility-content">
            {renderTabContent()}
          </div>

          {/* Actions */}
          <div className="accessibility-actions">
            <button
              onClick={resetSettings}
              className="accessibility-reset-btn"
              aria-label="Réinitialiser tous les paramètres"
            >
              <RotateCcw size={16} />
              Réinitialiser
            </button>

            <div className="accessibility-shortcuts">
              <h4 className="accessibility-shortcuts-title">Raccourcis clavier :</h4>
              <div className="accessibility-shortcuts-grid">
                <div className="accessibility-shortcut">
                  <kbd>Alt+A</kbd> Menu
                </div>
                <div className="accessibility-shortcut">
                  <kbd>Alt+C</kbd> Contraste
                </div>
                <div className="accessibility-shortcut">
                  <kbd>Alt+D</kbd> Dyslexie
                </div>
                <div className="accessibility-shortcut">
                  <kbd>Alt+S</kbd> Audio
                </div>
                <div className="accessibility-shortcut">
                  <kbd>Alt+M</kbd> Sombre
                </div>
                <div className="accessibility-shortcut">
                  <kbd>Alt±</kbd> Police
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityMenu;