# Plateforme de Validation de Plans de Cours avec IA

## 📄 Présentation du Projet

Ce projet est une application web développée dans le cadre du cours de Développement Web 2. Elle permet aux enseignants d'élaborer leurs plans de cours et de les faire valider instantanément par une Intelligence Artificielle (OpenAI GPT-4o).

La plateforme offre deux rôles distincts avec des interfaces dédiées :
1. **Enseignant** : Création de plans, rédaction de réponses, validation IA interactive et génération de PDF.
2. **Administrateur-Coordonnateur** : Gestion des modèles de formulaires, définition des règles de validation IA et supervision des plans soumis.

## 🚀 Fonctionnalités Principales

### Pour les Enseignants
* Création de plans de cours : Remplissage dynamique basé sur le modèle actif de la session.
* Validation par IA : Analyse en temps réel de chaque section du plan selon des règles pédagogiques précises.
* Feedback immédiat : Réception de suggestions de correction (Conforme, À améliorer, Non conforme).
* Génération de PDF : Création automatique d'un document PDF officiel stocké dans le cloud.
* Tableau de bord : Suivi de l'état des plans (Brouillon, Soumis, Validé).

### Pour l'Administrateur-Coordonnateur
* Gestion des modèles : Création, modification et archivage des formulaires de plans de cours.
* Configuration IA : Définition des "prompts" et règles de validation pour chaque question.
* Suivi des soumissions : Vue d'ensemble de tous les plans soumis par les enseignants.
* Validation finale : Possibilité de commenter, demander des corrections ou valider définitivement un plan.

## 🛠 Technologies Utilisées

* Frontend : React 19, Vite, Bulma CSS (Interface responsive).
* Backend & Serverless : Firebase Cloud Functions (Node.js).
* Base de données : Cloud Firestore (NoSQL).
* Authentification : Firebase Auth (Google & Email/Password).
* Stockage : Firebase Storage (Hébergement des PDF générés).
* IA : OpenAI API (Modèle `gpt-4o-mini`).
* Génération PDF : Bibliothèque `jsPDF`.


## ⚙️ Instructions d'Installation

### 1. Cloner le dépôt
git clone https://github.com/Motgy/tp2-appweb2.git  
cd tp2-appweb2

### 2. Installer les dépendances Frontend
npm install

### 3. Installer les dépendances Backend (Cloud Functions)
cd functions  
npm install  
cd ..


## 💻 Démarrage en Local

### Lancer le Frontend (Site Web)
À la racine du projet :

npm run dev

Le site sera accessible via l'URL indiquée (généralement http://localhost:5173).

### Lancer les Fonctions Cloud (Optionnel)
Pour tester le backend localement (Firebase CLI requis) :

npm install -g firebase-tools  
firebase emulators:start --only functions

## ☁️ Instructions de Déploiement

Le déploiement se fait sur Firebase Hosting et Firebase Functions.

### 1. Préparation au déploiement
firebase login

### 2. Sélection du projet
firebase use --add  
Sélectionnez votre projet existant (ex : tp2appweb2-35f8c)

### 3. Compiler le projet React
npm run build

### 4. Déployer sur Firebase
firebase deploy

*Important pour l'IA : Si vous déployez sur un nouveau projet Firebase, assurez-vous que votre forfait Firebase est au minimum Blaze (Pay as you go) pour permettre aux Cloud Functions d'effectuer des requêtes externes vers l'API OpenAI.*

## 🧪 Comptes de Test

Pour faciliter l'évaluation, voici les comptes configurés (ou à créer via l'interface) :

* Administrateur : Créer un compte puis modifier son rôle manuellement dans Firestore (collection users) en mettant le champ `role: "admin"`.
* Enseignant : Tout nouveau compte créé via "Inscription" reçoit le rôle enseignant par défaut.

## 📂 Structure du Projet

/src : Code source de l'application React.  
/src/components : Composants réutilisables (Navbar, PDFGenerator, OpenAI handler).  
/src/pages : Vues principales (Dashboard, FormBuilder, FillPlan).  
/functions : Code backend Node.js pour l'intégration sécurisée de l'API OpenAI.  
firebase.json : Configuration du déploiement Firebase.  
firestore.rules & storage.rules : Règles de sécurité de la base de données.
