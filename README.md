# ft_transcendence - École 42 | Paris

<div align="center">
  <img src="https://img.shields.io/badge/game-Pong-brightgreen" alt="Pong">
  <img src="https://img.shields.io/badge/framework-Django-blue" alt="Django">
  <img src="https://img.shields.io/badge/database-PostgreSQL-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/devops-Docker-red" alt="Docker">
  <img src="https://img.shields.io/badge/security-2FA-blue" alt="2FA">
  <img src="https://img.shields.io/badge/application-SPA-brightgreen" alt="SPA">
  <img src="https://img.shields.io/badge/frontend-JavaScript-yellow" alt="JavaScript">
  <img src="https://img.shields.io/badge/graphics-Three.js-orange" alt="Three.js">
  <img src="https://img.shields.io/badge/multi--language-Yes-blue" alt="Multi-language">
  <img src="https://img.shields.io/badge/mobile-Compatible-yellow" alt="Mobile Compatible">
  <img src="https://img.shields.io/badge/compliance-GDPR-blue" alt="GDPR">
</div>

###
<div align="center">
  <img src="https://raw.githubusercontent.com/ayogun/42-project-badges/refs/heads/main/badges/ft_transcendencee.png?raw=true" alt="Badge du projet transcendence">
</div>

## Description

Le projet **`ft_transcendence`** est une plateforme Web innovante centrée sur le jeu **`Pong`**. Bien plus qu'un simple jeu local, il s'agit d'une application web complète, évolutive, et riche en fonctionnalités, permettant des interactions temps réel entre utilisateurs. Ce projet est conçu comme un exercice d'excellence en développement web, **`DevOps`**, et **`cybersécurité`**.

---

## Fonctionnalités Principales

### Partie Obligatoire
- **Jeu Pong en ligne** :
  - Mode **1v1** sur **`même machine`** ou **`en ligne`**
  - **Tournoi** avec organisation **`automatique`** des matchs.
- **Application Web Monopage (**`SPA`**)** :
  - Développée en **JavaScript** : **`vanilla`**.
  - Compatible avec la dernière version stable de **`Google Chrome`**.
- **Sécurité Basique** :
  - Connexion **`HTTPS`**.
  - Protection contre les injections **`SQL`** et **`XSS`**.
  - Stockage des mots de passe **`hashés`**.
- **Conteneurisation avec `Docker`** :
  - Déploiement via une commande simple (**`docker-compose up --build`**).

### Modules Avancés
Le projet peut être enrichi avec de nombreux modules pour atteindre **`100 %`** de complétion :

#### Web
- Backend avec **`Django`**.
- Utilisation de **`PostgreSQL`** comme base de données.
- Stockage des scores sur **`Ethereum`** (blockchain).

#### User Management
- **Authentification `OAuth2.0/42`**.
- Gestion des **profils** avec **`avatars`**, historique des **`matchs`**, et **`statistiques`**.
- Système d'**amis** avec affichage du **`statut`** en ligne.

#### Gameplay
- **Joueurs** **`distants`** et **`multijoueurs`**.
- **Chat** en **`direct`** avec **`invitations`** à jouer.
- **Matchmaking** **`automatisé`**.

#### Cybersécurité
- Mise en place de **`WAF/ModSecurity`**.
- Gestion des **secrets** avec **`HashiCorp Vault`**.
- Authentification **`2FA`** et **`JWT`**.
- Conformité **`GDPR`**.

#### DevOps
- **Monitoring** avec **`Prometheus/Grafana`**.
- Gestion des **logs via ELK `(Elasticsearch, Logstash, Kibana)`**.
- Architecture **backend** en **`microservices`**.

#### Graphiques
- **Graphismes** avancés avec **`ThreeJS`**.

#### Accessibilité
- **Multi-langue**, compatibilité multi-navigateurs, support mobile.
- **Accessibilité** pour **`malvoyants`**.

## Structure du Projet

```bash
ft_transcendence/
├── backend/
│   ├── manage.py
│   ├── settings.py
│   ├── urls.py
│   ├── models.py
│   └── views.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   └── pong.js
├── docker-compose.yml
├── .env
└── README.md
```

## Installation et Lancement
### Prérequis
  - **`Docker`** et **`Docker Compose`** installés.
  - Navigateur moderne (**`Google Chrome`** recommandé).

### Commandes
  - **1.** Clonez le dépôt :
    ```bash
    git clone https://github.com/raveriss/ft_transcendence.git
    cd ft_transcendence
    ```
  - **2.** Configurez les variables d'environnement :
    - Créez un fichier **`.env`** à la racine et renseignez-y vos clés **`API`**, mots de passe et paramètres.

  - **3.** Lancez l'application :
    ```bash
    docker-compose up --build
    ```
  - **4.** Accédez à l'application :
    - Ouvrez votre navigateur et rendez-vous sur http://localhost:3000.

## Modules et Extensions
### Modules Principaux
  - **`1`.** **`Backend Framework`** : Développement du backend avec **`Django`**.
  - **`2`.** **`User Management`** : Authentification, gestion des profils et historique des matchs.
  - **`3`.** **`Gameplay`** : Mode multijoueur, personnalisation des règles, et ajout d'une **`IA`**.
  - **`4`.** **`Cybersecurity`** : Mise en place de **`2FA`** et **`JWT`**.
  - **`5`.** **`DevOps`** : Monitoring avec **`Prometheus/Grafana`** et gestion des logs avec **`ELK`**.
  
### Modules Bonus
  - **`Accessibilité`** : Compatibilité multi-langue et support pour les utilisateurs malvoyants.
  - **`Graphiques 3D`** : Utilisation de **`ThreeJS`** pour une expérience immersive.
  - **`Blockchain`** : Stockage des scores de tournois sur **`Ethereum`**.

## Aperçu
### Interface du jeu
<div align="center"> <img src="assets/gameplay.png" alt="Aperçu du jeu Pong" width="800"> </div>

### Statistiques des utilisateurs
<div align="center"> <img src="assets/user-stats.png" alt="Statistiques utilisateur" width="800"> </div>

## Contributeurs
- [raveriss](https://github.com/raveriss)

## Ressources Utilisées

- [Documentation Django](https://docs.djangoproject.com/en/5.1/)
- [PostgreSQL](https://www.postgresql.org/)
- [ThreeJS](https://threejs.org/)
- [Tutoriel Pong](https://www.ponggame.org/)
