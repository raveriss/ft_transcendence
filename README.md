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
  - Mode **`1v1`** sur **`même machine`** ou **`en ligne`**
  - **`Tournoi`** avec organisation **`automatique`** des **`matchs`**.
- **Application Web Monopage (**`SPA`**)** :
  - Développée en **`JavaScript`** : **`vanilla`**.
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
- Stockage des scores sur **`Ethereum`** (**`blockchain`**).

#### User Management
- **Authentification `OAuth2.0/42`**.
- Gestion des **`profils`** avec **`avatars`**, historique des **`matchs`**, et **`statistiques`**.
- Système d'**`amis`** avec affichage du **`statut`** en ligne.

#### Gameplay
- **Joueurs** **`distants`** et **`multijoueurs`**.
- **Chat** en **`direct`** avec **`invitations`** à jouer.
- **Matchmaking** **`automatisé`**.

#### Cybersécurité
- Mise en place de **`WAF/ModSecurity`**.
- Gestion des **`secrets`** avec **`HashiCorp Vault`**.
- Authentification **`2FA`** et **`JWT`**.
- Conformité **`GDPR`**.

#### DevOps
- **`Monitoring`** avec **`Prometheus/Grafana`**.
- Gestion des **`logs via ELK` `(Elasticsearch, Logstash, Kibana)`**.
- Architecture **`backend`** en **`microservices`**.

#### Graphiques
- **Graphismes** avancés avec **`ThreeJS`**.

#### Accessibilité
- **Multi-langue**, compatibilité **`multi-navigateurs`**, support mobile.
- **Accessibilité** pour **`malvoyants`**.

## Structure du Projet

```bash
ft_transcendence/
├── backend
│   ├── conecte_me_backend
│   │   ├── __init__.py
│   │   ├── __pycache__
│   │   │   ├── __init__.cpython-310.pyc
│   │   │   ├── settings.cpython-310.pyc
│   │   │   └── urls.cpython-310.pyc
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── Dockerfile
│   ├── manage.py
│   ├── oauth_app
│   │   ├── __init__.py
│   │   ├── migrations
│   │   │   ├── 0001_initial.py
│   │   │   ├── __init__.py
│   │   │   └── __pycache__
│   │   │       └── __init__.cpython-310.pyc
│   │   ├── models.py
│   │   ├── __pycache__
│   │   │   ├── __init__.cpython-310.pyc
│   │   │   ├── models.cpython-310.pyc
│   │   │   ├── urls.cpython-310.pyc
│   │   │   ├── utils.cpython-310.pyc
│   │   │   └── views.cpython-310.pyc
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   └── views.py
│   └── requirements.txt
├── certs
│   ├── localhost.crt
│   └── localhost.key
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   └── static
│       ├── css
│       │   └── main.css
│       ├── img
│       │   ├── 42_logo.svg
│       │   └── PONG_Accueil.png
│       └── js
│           └── main.js
├── nginx.conf
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
    - Ouvrez votre navigateur et rendez-vous sur **`http://localhost:3000`**.

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

  - ### Inscription et authentification
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/Screenshot_Registration_and_authentication_windows.png" alt="Inscription et authentification">
    </div> 

  - ### Interface du jeu
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/Screenshot_game_interface_windows.png" alt="Interface du jeu">
    </div> 
  - ### Statistiques des utilisateurs
  <div align="center"> <img src="assets/user-stats.png" alt="Statistiques utilisateur"> </div>

  - ### Différents modes de jeu
    1. **Mode classique** :
      <div align="center"> <img src="assets/classic-mode.png" alt="Mode classique du Pong"> </div>
     
    2. **Mode tournoi** :
     <div align="center"> <img src="assets/tournament-mode.png" alt="Mode tournoi avec plusieurs joueurs"> </div>
     
    3. **Mode spectateur** :
     <div align="center"> <img src="assets/spectator-mode.png" alt="Vue du mode spectateur"> </div>
  
    4. **Mode solo avec IA** :
     <div align="center"> <img src="assets/solo-ai-mode.png" alt="Mode solo avec une IA"> </div>
  
    5. **Mode multijoueur en ligne** :
     <div align="center"> <img src="assets/online-mode.png" alt="Mode multijoueur en ligne"> </div>
    
  - ### Interface utilisateurs et Sécurité
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/Screenshot_user_windows.png" alt="Interface du jeu">
    </div> 

  - ### Personnalisation et réglages
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/Screenshot_setup_windows.png" alt="Personnalisation des avatars et réglages">
    </div>

  - ### Matchmaking
<div align="center"> <img src="assets/matchmaking.png" alt="Système de matchmaking"> </div>

  - ### Tournois
<div align="center"> <img src="assets/tournament.png" alt="Organisation des tournois"> </div>

  - ### Chat en direct
<div align="center"> <img src="assets/live-chat.png" alt="Chat en direct entre les joueurs"> </div>

  - ### Fonctionnalités bonus : Autre jeu
    <div align="center"> <img src="assets/bonus-other-game.png" alt="Exemple d'un autre jeu implémenté"> </div>
  
  - ### Fonctionnalités bonus : Pong 3D
    <div align="center"> <img src="assets/bonus-pong-3d.png" alt="Aperçu du Pong en 3D"> </div>
  
## Contributeurs
- [raveriss](https://github.com/raveriss)

## Ressources Utilisées

- [Request for Comments 4226 HOTP: An HMAC-Based One-Time Password Algorithm](https://datatracker.ietf.org/doc/html/rfc4226)

- [Request for Comments 6238 TOTP: Time-Based One-Time Password Algorithm](https://datatracker.ietf.org/doc/html/rfc6238)

- [RGPD](https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=fr)

- [Documentation Django](https://docs.djangoproject.com/fr/5.1/)
- [Openlassrooms debutez avec le framework django](https://openclassrooms.com/fr/courses/7172076-debutez-avec-le-framework-django)
- [Openlassrooms allez plus loin avec le framework django](https://openclassrooms.com/fr/courses/7192426-allez-plus-loin-avec-le-framework-django)
- [Openlassrooms mettez-en-place-une-api-avec-django-rest-framework/7424482-decouvrez-django-rest-framework](https://openclassrooms.com/fr/courses/7192416-mettez-en-place-une-api-avec-django-rest-framework/7424482-decouvrez-django-rest-framework)
- [Openlassrooms deployez-une-application-django](https://openclassrooms.com/fr/courses/4425101-deployez-une-application-django)
- [Django Rest Framework cours tutoriel exemples](https://python.doctor/page-django-rest-framework-drf-cours-tuto-tutoriel-exemples)

- [Openlassrooms apprenez a programmer avec javascript](https://openclassrooms.com/fr/courses/7696886-apprenez-a-programmer-avec-javascript)
- [Lesieur apprenez a programmer avec javascript](https://blog.lesieur.name/vanilla-js-france/#id)

- [Ethereum guides](https://ethereum.org/fr/guides/)
- [Soliditylang Documentation](https://docs.soliditylang.org/fr/latest/)

- [Play list Video Tuto Docker #01](https://www.youtube.com/watch?v=GVogBCqrXck&list=PLn6POgpklwWqVFAFrjnpXGhjveRUTHGa_&ab_channel=xavki)
- [Play list Video Tuto Docker-Compose #01](https://www.youtube.com/watch?v=pMAGe6nTkws&list=PLn6POgpklwWqaC1pdx02SrrgOaL2ZL7G0&ab_channel=xavki)

- [Google Authenticator PAM module](https://github.com/google/google-authenticator-libpam)
- [Introducing 2FA with Google Authenticator and Node.js](https://www.youtube.com/watch?v=6mxA9Zp8600&ab_channel=Omnidev)

- [Tuto docker comprendre docker partie #01](https://www.wanadevdigital.fr/23-tuto-docker-comprendre-docker-partie1/)
- [Tuto docker comprendre docker partie #02](https://www.wanadevdigital.fr/24-tuto-docker-demarrer-docker-partie-2/)
- [Tuto docker comprendre docker partie #03](https://www.wanadevdigital.fr/27-tuto-docker-les-commandes-et-docker-partie-3/)

- [PostgreSQL](https://docs.postgresql.fr/)
- [TUTORIALS POSTGRESQL](https://www.youtube.com/watch?v=_LmASWXwdoM&list=PLn6POgpklwWonHjoGXXSIXJWYzPSy2FeJ&ab_channel=xavki)

- [TUTORIALS PROMETHEUS / GRAFANA](https://www.youtube.com/watch?v=wcTr8Hm7SCQ&list=PLn6POgpklwWo3_2pj5Jflqwla62P5OI8n&ab_channel=xavki)

- [TUTORIALS Introduction : why ? what ? - #ELK 01](https://www.youtube.com/watch?v=QmSIml8lo-c&list=PLn6POgpklwWqSvhjguOUJCH8ItydtIvKZ&ab_channel=XavkiEn)


- [ThreeJS](https://threejs.org/docs/index.html#manual/fr/introduction/Creating-a-scene)
- [Tutoriel Pong](https://www.ponggame.org/)
