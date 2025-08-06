# 🎯 Quizz Multi-niveaux Inclusif (FLE)

Application web inclusive pour l'apprentissage du **Français Langue Étrangère (FLE)**, pensée pour **tous les publics**, y compris les personnes :
- Ayant peu ou pas d’aisance avec l’informatique (*illectronisme*)
- Ayant un handicap visuel, auditif ou des troubles DYS
- Souhaitant s’auto-évaluer et progresser à leur rythme

---

## 📚 Objectif

Permettre aux apprenants de **s’évaluer de manière ludique**, tout en offrant aux formateurs la possibilité de créer, gérer et classer facilement leurs questionnaires.

> Imaginez-vous dans un pays étranger où vous ne parlez pas la langue et n’êtes pas à l’aise avec l’informatique…  
> Cette application est là pour lever toutes ces barrières.

---

## 🚀 Fonctionnalités principales

### Pour les formateurs :
- ➕ **Ajouter**, ✏️ **modifier** et 🗑️ **supprimer** des questions
- 📋 **Créer un questionnaire** et y ajouter des questions existantes ou nouvelles
- 🔍 **Retrouver** ses questionnaires et les questions déjà créées
- 🏷️ **Classer par tags ou filtres** (thème, accessibilité, niveau, etc.)
- 🔑 **Gérer les utilisateurs** via un système d’identifiants

### Pour les apprenants :
- 🌈 Interface simple et intuitive, adaptée aux débutants en informatique
- 🦻 **Compatibilité avec lecteurs d’écran** et sous-titrage pour les malentendants
- 🔠 **Police et mise en page adaptées aux troubles DYS**
- 🎯 Mode **auto-évaluation** multi-niveaux

---

## 💡 Bonus (optionnel)
- 🤖 Système de **suggestions automatiques de questions** à partir des premières entrées enregistrées dans un questionnaire

---

## ♿ Accessibilité
L’application suit les recommandations **WCAG** et propose :
- **Contraste élevé** et modes d’affichage adaptés
- Navigation clavier complète
- Support des **lecteurs d’écran**
- Sous-titres et transcription pour tout contenu audio/vidéo
- Interface claire avec pictogrammes compréhensibles

---

## 🛠️ Stack technique
- **Front-end** : React / Vite.js (design simple et accessible)
- **Back-end** : Node.js / Express
- **Base de données** : MongoDB 
- **Auth** : JWT 

---

## 📦 Installation (exemple)
```bash
# Cloner le projet
git clone [https://github.com/IDGHIM/Hackathon_Quiz.git](https://github.com/IDGHIM/Hackathon_Quiz.git)

# Accéder au dossier
cd Hackathon_Quiz

# Installer les dépendances
cd client
npm install

cd server
npm install

# Lancer le serveur de développement
npm run dev
