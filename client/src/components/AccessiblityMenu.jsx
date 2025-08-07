import React, { useState, useEffect } from "react";
import "../styles/AccessibilityMenu.css";
import {
  FaUniversalAccess,
  FaEye,
  FaFont,
  FaPalette,
  FaVolumeUp,
  FaKeyboard,
  FaAdjust,
  FaGlasses,
  FaHandPaper,
  FaMouse,
  FaExpand,
  FaTimes,
  FaRedo,
} from "react-icons/fa";

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("accessibilitySettings");
    return saved
      ? JSON.parse(saved)
      : {
          contrast: "normal",
          colorBlind: "none",
          dyslexia: false,
          reduceMotion: false,
          largeCursor: false,
          focusHighlight: true,
          audioEnabled: false,
          speechRate: 0.8,
          speechVolume: 1.0,
        };
  });

  useEffect(() => {
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
    applySettings();
  }, [settings]);

  const applySettings = () => {
    const body = document.body;
    body.classList.remove(
      "high-contrast",
      "dyslexia-mode",
      "reduce-motion",
      "large-cursor",
      "colorblind-protanopia",
      "colorblind-deuteranopia",
      "colorblind-tritanopia",
      "colorblind-monochrome"
    );

    if (settings.contrast === "high") body.classList.add("high-contrast");
    if (settings.colorBlind !== "none")
      body.classList.add(`colorblind-${settings.colorBlind}`);
    if (settings.dyslexia) body.classList.add("dyslexia-mode");
    if (settings.reduceMotion) body.classList.add("reduce-motion");
    if (settings.largeCursor) body.classList.add("large-cursor");
  };

  const speak = (text, interrupt = true) => {
    if (!settings.audioEnabled) return;
    if (interrupt) window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = settings.speechRate;
    utterance.volume = settings.speechVolume;
    window.speechSynthesis.speak(utterance);
  };

  const resetSettings = () => {
    const defaultSettings = {
      contrast: "normal",
      colorBlind: "none",
      dyslexia: false,
      reduceMotion: false,
      largeCursor: false,
      focusHighlight: true,
      audioEnabled: false,
      speechRate: 0.8,
      speechVolume: 1.0,
    };
    setSettings(defaultSettings);
    speak("Paramètres d'accessibilité réinitialisés");
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        setIsOpen((open) => !open);
        speak(
          isOpen ? "Menu d'accessibilité fermé" : "Menu d'accessibilité ouvert"
        );
      }
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        setSettings((prev) => ({
          ...prev,
          contrast: prev.contrast === "normal" ? "high" : "normal",
        }));
        speak(
          `Contraste ${
            settings.contrast === "normal" ? "élevé" : "normal"
          } activé`
        );
      }
      if (e.altKey && e.key === "d") {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, dyslexia: !prev.dyslexia }));
        speak(`Mode dyslexie ${!settings.dyslexia ? "activé" : "désactivé"}`);
      }
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }));
        speak(
          `Synthèse vocale ${!settings.audioEnabled ? "activée" : "désactivée"}`
        );
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line
  }, [isOpen, settings]);

  // Synthèse vocale au survol (optionnel)
  useEffect(() => {
    if (!settings.audioEnabled) return;
    const handleHover = (e) => {
      const element = e.target;
      const text =
        element.textContent ||
        element.alt ||
        element.placeholder ||
        element.title;
      if (text && element.tagName !== "SCRIPT" && element.tagName !== "STYLE") {
        const timer = setTimeout(() => {
          speak(text, false);
        }, 500);
        element.addEventListener("mouseleave", () => clearTimeout(timer), {
          once: true,
        });
      }
    };
    document.addEventListener("mouseenter", handleHover, true);
    return () => document.removeEventListener("mouseenter", handleHover, true);
  }, [settings.audioEnabled, settings.speechRate, settings.speechVolume]);

  return (
    <>
      <button
        className="accessibility-toggle"
        onClick={() => {
          setIsOpen(!isOpen);
          speak(
            isOpen ? "Fermeture du menu" : "Ouverture du menu d'accessibilité"
          );
        }}
        aria-label="Menu d'accessibilité"
        aria-expanded={isOpen}
        title="Ouvrir le menu d'accessibilité (Alt+A)"
      >
        <FaUniversalAccess size={24} />
        <span className="sr-only">Accessibilité</span>
      </button>

      {isOpen && (
        <div
          className="accessibility-menu"
          role="dialog"
          aria-label="Paramètres d'accessibilité"
        >
          <div className="accessibility-header">
            <h2>
              <FaUniversalAccess /> Paramètres d'accessibilité
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
              aria-label="Fermer le menu"
            >
              <FaTimes />
            </button>
          </div>

          <div className="accessibility-content">
            {/* Vision */}
            <section className="accessibility-section">
              <h3>
                <FaEye /> Vision
              </h3>

              {/* Contraste */}
              <div className="control-group">
                <label htmlFor="contrast">Contraste</label>
                <button
                  className={`toggle-btn ${
                    settings.contrast === "high" ? "active" : ""
                  }`}
                  onClick={() => {
                    const newContrast =
                      settings.contrast === "normal" ? "high" : "normal";
                    setSettings((prev) => ({ ...prev, contrast: newContrast }));
                    speak(
                      `Contraste ${newContrast === "high" ? "élevé" : "normal"}`
                    );
                  }}
                  aria-pressed={settings.contrast === "high"}
                >
                  <FaAdjust />{" "}
                  {settings.contrast === "high" ? "Élevé" : "Normal"}
                </button>
              </div>

              {/* Daltonisme */}
              <div className="control-group">
                <label htmlFor="colorblind">Mode daltonien</label>
                <select
                  id="colorblind"
                  value={settings.colorBlind}
                  onChange={(e) => {
                    setSettings((prev) => ({
                      ...prev,
                      colorBlind: e.target.value,
                    }));
                    speak(
                      `Mode daltonien: ${
                        e.target.value === "none" ? "désactivé" : e.target.value
                      }`
                    );
                  }}
                  className="select-control"
                >
                  <option value="none">Aucun</option>
                  <option value="protanopia">Protanopie (rouge-vert)</option>
                  <option value="deuteranopia">
                    Deutéranopie (vert-rouge)
                  </option>
                  <option value="tritanopia">Tritanopie (bleu-jaune)</option>
                  <option value="monochrome">Monochrome</option>
                </select>
              </div>
            </section>

            {/* Lecture */}
            <section className="accessibility-section">
              <h3>
                <FaGlasses /> Lecture
              </h3>
              {/* Mode dyslexie */}
              <div className="control-group">
                <label htmlFor="dyslexia">Mode dyslexie</label>
                <button
                  className={`toggle-btn ${settings.dyslexia ? "active" : ""}`}
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      dyslexia: !prev.dyslexia,
                    }));
                    speak(
                      `Mode dyslexie ${
                        !settings.dyslexia ? "activé" : "désactivé"
                      }`
                    );
                  }}
                  aria-pressed={settings.dyslexia}
                >
                  <FaFont /> {settings.dyslexia ? "Activé" : "Désactivé"}
                </button>
              </div>
            </section>

            {/* Audio */}
            <section className="accessibility-section">
              <h3>
                <FaVolumeUp /> Audio
              </h3>
              {/* Synthèse vocale */}
              <div className="control-group">
                <label htmlFor="audio">Synthèse vocale</label>
                <button
                  className={`toggle-btn ${
                    settings.audioEnabled ? "active" : ""
                  }`}
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      audioEnabled: !prev.audioEnabled,
                    }));
                    speak(
                      `Synthèse vocale ${
                        !settings.audioEnabled ? "activée" : "désactivée"
                      }`
                    );
                  }}
                  aria-pressed={settings.audioEnabled}
                >
                  <FaVolumeUp />{" "}
                  {settings.audioEnabled ? "Activée" : "Désactivée"}
                </button>
              </div>

              {/* Vitesse de lecture */}
              {settings.audioEnabled && (
                <div className="control-group">
                  <label htmlFor="speech-rate">
                    Vitesse de lecture: {Math.round(settings.speechRate * 100)}%
                  </label>
                  <input
                    type="range"
                    id="speech-rate"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.speechRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      setSettings((prev) => ({ ...prev, speechRate: rate }));
                      speak(`Vitesse réglée à ${Math.round(rate * 100)}%`);
                    }}
                    className="range-control"
                  />
                </div>
              )}

              {/* Volume */}
              {settings.audioEnabled && (
                <div className="control-group">
                  <label htmlFor="speech-volume">
                    Volume: {Math.round(settings.speechVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    id="speech-volume"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.speechVolume}
                    onChange={(e) => {
                      const volume = parseFloat(e.target.value);
                      setSettings((prev) => ({
                        ...prev,
                        speechVolume: volume,
                      }));
                      speak(`Volume réglé à ${Math.round(volume * 100)}%`);
                    }}
                    className="range-control"
                  />
                </div>
              )}
            </section>

            {/* Navigation */}
            <section className="accessibility-section">
              <h3>
                <FaMouse /> Navigation
              </h3>

              {/* Grand curseur */}
              <div className="control-group">
                <label htmlFor="cursor">Grand curseur</label>
                <button
                  className={`toggle-btn ${
                    settings.largeCursor ? "active" : ""
                  }`}
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      largeCursor: !prev.largeCursor,
                    }));
                    speak(
                      `Grand curseur ${
                        !settings.largeCursor ? "activé" : "désactivé"
                      }`
                    );
                  }}
                  aria-pressed={settings.largeCursor}
                >
                  <FaMouse /> {settings.largeCursor ? "Activé" : "Désactivé"}
                </button>
              </div>

              {/* Réduction des animations */}
              <div className="control-group">
                <label htmlFor="motion">Réduire les animations</label>
                <button
                  className={`toggle-btn ${
                    settings.reduceMotion ? "active" : ""
                  }`}
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      reduceMotion: !prev.reduceMotion,
                    }));
                    speak(
                      `Animations ${
                        !settings.reduceMotion ? "réduites" : "normales"
                      }`
                    );
                  }}
                  aria-pressed={settings.reduceMotion}
                >
                  <FaHandPaper />{" "}
                  {settings.reduceMotion ? "Activé" : "Désactivé"}
                </button>
              </div>
            </section>

            {/* Actions */}
            <div className="accessibility-actions">
              <button
                onClick={resetSettings}
                className="reset-btn"
                aria-label="Réinitialiser tous les paramètres"
              >
                <FaRedo /> Réinitialiser
              </button>

              <div className="shortcuts-info">
                <h4>Raccourcis clavier :</h4>
                <ul>
                  <li>
                    <kbd>Alt</kbd> + <kbd>A</kbd> : Ouvrir le menu
                  </li>
                  <li>
                    <kbd>Alt</kbd> + <kbd>C</kbd> : Contraste
                  </li>
                  <li>
                    <kbd>Alt</kbd> + <kbd>D</kbd> : Mode dyslexie
                  </li>
                  <li>
                    <kbd>Alt</kbd> + <kbd>S</kbd> : Synthèse vocale
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityMenu;
