import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Settings,
  Eye,
  Type,
  Palette,
  Volume2,
  Keyboard,
  Contrast,
  Glasses,
  Hand,
  Mouse,
  Maximize,
  X,
  RotateCcw,
  Sun,
  Moon,
  Zap,
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
      const firstFocusable = menuRef.current.querySelector('button:not(.close-btn)');
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
      className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 text-left ${
        active 
          ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-102'
      }`}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      onMouseEnter={() => settings.audioEnabled && speak(ariaLabel, false)}
    >
      {Icon && <Icon size={18} />}
      <span className="flex-1">{children}</span>
      <span className={`px-2 py-1 text-xs rounded ${active ? 'bg-blue-500' : 'bg-gray-300'}`}>
        {active ? 'ON' : 'OFF'}
      </span>
    </button>
  );

  const SliderControl = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = "", icon: Icon }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {Icon && <Icon size={16} />}
        {label}: <span className="font-bold text-blue-600">{value}{unit}</span>
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
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "vision":
        return (
          <div className="space-y-4">
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Palette size={16} />
                Mode daltonien
              </label>
              <select
                value={settings.colorBlind}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, colorBlind: e.target.value }));
                  speak(`Mode daltonien: ${e.target.value === "none" ? "désactivé" : e.target.value}`);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-4">
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
          <div className="space-y-4">
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
          <div className="space-y-4">
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
          <div className="space-y-4">
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        onClick={() => {
          setIsOpen(!isOpen);
          speak(isOpen ? "Fermeture du menu" : "Ouverture du menu d'accessibilité");
        }}
        aria-label="Menu d'accessibilité"
        aria-expanded={isOpen}
        title="Ouvrir le menu d'accessibilité (Alt+A)"
      >
        <Settings size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="sr-only">Accessibilité</span>
      </button>

      {/* Menu d'accessibilité */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col"
          role="dialog"
          aria-label="Paramètres d'accessibilité"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings size={20} />
              Accessibilité
            </h2>
            <button
              onClick={() => {
                setIsOpen(false);
                speak("Menu fermé");
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Onglets */}
          <div className="flex bg-gray-50 p-1 m-4 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    speak(`Onglet ${tab.label}`);
                  }}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenu des onglets */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderTabContent()}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <button
              onClick={resetSettings}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
              aria-label="Réinitialiser tous les paramètres"
            >
              <RotateCcw size={16} />
              Réinitialiser
            </button>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Raccourcis clavier :</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                <div><kbd className="bg-blue-100 px-1 rounded">Alt+A</kbd> Menu</div>
                <div><kbd className="bg-blue-100 px-1 rounded">Alt+C</kbd> Contraste</div>
                <div><kbd className="bg-blue-100 px-1 rounded">Alt+D</kbd> Dyslexie</div>
                <div><kbd className="bg-blue-100 px-1 rounded">Alt+S</kbd> Audio</div>
                <div><kbd className="bg-blue-100 px-1 rounded">Alt+M</kbd> Sombre</div>
                <div><kbd className="bg-blue-100 px-1 rounded">Alt±</kbd> Police</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityMenu;