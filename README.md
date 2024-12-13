# ft_transcendence - École 42 | Paris

<div align="center">
  <img src="https://img.shields.io/badge/framework-Django-blue" alt="Django">
  <img src="https://img.shields.io/badge/database-PostgreSQL-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/frontend-Javascript-yellow" alt="Javascript">
  <img src="https://img.shields.io/badge/security-2FA-brightgreen" alt="2FA">
  <img src="https://img.shields.io/badge/school-42-green" alt="42">
</div>

###
<div align="center">
  <img src="https://raw.githubusercontent.com/ayogun/42-project-badges/refs/heads/main/badges/ft_transcendencee.png?raw=true" alt="Badge du projet push_swap">
</div>

## Description

Le projet **ft_transcendence** consiste à développer une application web autour du jeu **Pong**, intégrant des fonctionnalités avancées comme le matchmaking, la gestion des utilisateurs, la sécurité renforcée et l'expérience utilisateur. Ce projet est conçu pour être évolutif, sécurisé, et immersif.

## Fonctionnalités

- **Jeu Pong multijoueur en temps réel** :
  - Mode 1v1 en local ou en ligne.
  - Matchmaking automatique pour des tournois.
  - Option pour ajouter des règles personnalisées ou des power-ups.

- **Interface utilisateur** :
  - Application monopage (SPA) en Javascript Vanilla.
  - Compatible avec les navigateurs modernes (optimisé pour Google Chrome).

- **Sécurité** :
  - Stockage des mots de passe avec hachage.
  - Protection contre les injections SQL et XSS.
  - Connexions HTTPS.
  - Authentification OAuth2 et 2FA.

- **Gestion des utilisateurs** :
  - Enregistrement et connexion sécurisés.
  - Gestion des profils : avatars, historique des matchs, et statistiques.
  - Fonctionnalité d'amis avec affichage du statut en ligne.

- **DevOps** :
  - Conteneurisation avec Docker.
  - Déploiement automatisé avec `docker-compose`.

## Structure du Projet

```bash
.
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
  - Docker et Docker Compose installés.
  - Navigateur moderne (Google Chrome recommandé).

### Commandes
  - 1 Clonez le dépôt :
    ```bash
    git clone https://github.com/raveriss/ft_transcendence.git
    cd ft_transcendence
    ```
  - 2 Configurez les variables d'environnement :
    - Créez un fichier .env à la racine et renseignez-y vos clés API, mots de passe et paramètres.

  - 3 Lancez l'application :
    ```bash
    docker-compose up --build
    ```
  - 4 Accédez à l'application :
    - Ouvrez votre navigateur et rendez-vous sur http://localhost:3000.

## Modules et Extensions
### Modules Principaux
  - 1 Backend Framework : Développement du backend avec Django.
  - 2 User Management : Authentification, gestion des profils et historique des matchs.
  - 3 Gameplay : Mode multijoueur, personnalisation des règles, et ajout d'une IA.
  - 4 Cybersecurity : Mise en place de 2FA et JWT.
  - 5 DevOps : Monitoring avec Prometheus/Grafana et gestion des logs avec ELK.
  
### Modules Bonus
  - Accessibilité : Compatibilité multi-langue et support pour les utilisateurs malvoyants.
  - Graphiques 3D : Utilisation de ThreeJS/WebGL pour une expérience immersive.
  - Blockchain : Stockage des scores de tournois sur Ethereum.

## Aperçu
### Interface du jeu
<div align="center"> <img src="assets/gameplay.png" alt="Aperçu du jeu Pong" width="800"> </div>

## Statistiques des utilisateurs
<div align="center"> <img src="assets/user-stats.png" alt="Statistiques utilisateur" width="800"> </div>

## Contributeurs
- [raveriss](https://github.com/raveriss)

## Ressources Utilisées

- [Documentation Django](https://docs.djangoproject.com/en/5.1/)
- [PostgreSQL](https://www.postgresql.org/)
- [ThreeJS](https://threejs.org/)
- [Tutoriel Pong](https://www.ponggame.org/)
