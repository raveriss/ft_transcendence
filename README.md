# ft_transcendence - École 42 | Paris

<div align="center">
  <img src="https://img.shields.io/badge/game-Pong-brightgreen" alt="Pong">
  <img src="https://img.shields.io/badge/framework-Django-blue" alt="Django">
  <img src="https://img.shields.io/badge/database-PostgreSQL-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/devops-Docker-red" alt="Docker">
  <img src="https://img.shields.io/badge/security-2FA-blue" alt="2FA">
  <img src="https://img.shields.io/badge/application-SPA-brightgreen" alt="SPA">
  <img src="https://img.shields.io/badge/frontend-JavaScript-yellow" alt="JavaScript">
  <img src="https://img.shields.io/badge/multi--language-Yes-blue" alt="Multi-language">
  <img src="https://img.shields.io/badge/compliance-GDPR-blue" alt="GDPR">
  <img src="https://img.shields.io/badge/authentication-OAuth2.0/42-blueviolet" alt="OAuth2.0/42">
  <img src="https://img.shields.io/badge/logging-ELK-orange" alt="ELK">
  <img src="https://img.shields.io/badge/architecture-Microservices-ff69b4" alt="Microservices">
  <img src="https://img.shields.io/badge/security-WAF%2FModSecurity-red" alt="WAF/ModSecurity">
  <img src="https://img.shields.io/badge/secrets-HashiCorp%20Vault-blue" alt="HashiCorp Vault">
  <img src="https://img.shields.io/badge/matchmaking-Automated-blue" alt="Matchmaking">
  <img src="https://img.shields.io/badge/status-Friends%20Online-green" alt="Friends Online">
  <img src="https://img.shields.io/badge/tournament-Automatic%20Organization-blue" alt="Automatic Tournament">
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
.
├── backend
│   ├── conecte_me_backend
│   │   ├── asgi.py
│   │   ├── __init__.py
│   │   ├── middleware.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── wsgi.py
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── game
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── consumers.py
│   │   ├── __init__.py
│   │   ├── migrations
│   │   │   ├── 0001_initial.py
│   │   │   ├── 0002_gamesettings_paddle_size_matchhistory.py
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── routing.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── logs
│   │   ├── django.log
│   │   └── frontend.log
│   ├── manage.py
│   ├── media
│   │   └── profile_pictures
│   │       └── default_avatar.png
│   ├── oauth_app
│   │   ├── __init__.py
│   │   ├── jwt_decorator.py
│   │   ├── migrations
│   │   │   ├── 0001_initial.py
│   │   │   ├── 0002_user42_email_address_user42_first_name_and_more.py
│   │   │   ├── 0003_user42_is_2fa_enabled_user42_totp_secret.py
│   │   │   ├── 0004_alter_user42_totp_secret.py
│   │   │   ├── 0005_user42_profile_image.py
│   │   │   ├── 0006_alter_user42_profile_image_userloginhistory.py
│   │   │   ├── 0007_userloginhistory_is_connected.py
│   │   │   ├── 0008_alter_user42_username.py
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── templates
│   │   │   └── 2fa_setup.html
│   │   ├── tests.py
│   │   ├── twofa_views.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   └── views.py
│   ├── requirements.txt
│   └── tournament
│       ├── admin.py
│       ├── apps.py
│       ├── forms.py
│       ├── __init__.py
│       ├── migrations
│       │   └── __init__.py
│       ├── models.py
│       ├── tests.py
│       ├── urls.py
│       └── views.py
├── certs
│   ├── localhost.crt
│   └── localhost.key
├── docker-compose.yml
├── elk
│   ├── elasticsearch
│   │   └── elasticsearch.yml
│   ├── elk_initializer.sh
│   ├── filebeat.yml
│   ├── kibana
│   │   └── kibana.yml
│   ├── logstash
│   │   ├── logstash.conf
│   │   └── logstash.yml
│   └── saved_objects.ndjson
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   └── static
│       ├── css
│       │   ├── board.css
│       │   ├── game.css
│       │   ├── game_tournament.css
│       │   ├── login.css
│       │   ├── main.css
│       │   ├── privacy.css
│       │   ├── setup.css
│       │   ├── signup.css
│       │   ├── social.css
│       │   ├── stats.css
│       │   ├── team.css
│       │   ├── terms.css
│       │   ├── tournament.css
│       │   ├── tournament_details.css
│       │   └── user.css
│       ├── fonts
│       │   ├── PongGame.woff
│       │   └── PongGame.woff2
│       ├── img
│       │   ├── 42_logo.png
│       │   ├── default_avatar.png
│       │   ├── favicon.ico
│       │   ├── field_basketball.png
│       │   ├── field_hockey.png
│       │   ├── field_NFL.png
│       │   ├── Game_anime.png
│       │   ├── jecointr.jpg
│       │   ├── mmaric.jpg
│       │   ├── ode-cleb.jpg
│       │   ├── PONG_Accueil.png
│       │   ├── PONG_seul.png
│       │   ├── raveriss.jpg
│       │   ├── return_arrow.png
│       │   └── sycourbi.jpg
│       ├── js
│       │   ├── 2fa.js
│       │   ├── board.js
│       │   ├── game.js
│       │   ├── game_tournament.js
│       │   ├── i18n.js
│       │   ├── login.js
│       │   ├── main.js
│       │   ├── router.js
│       │   ├── setup.js
│       │   ├── signin42.js
│       │   ├── signup.js
│       │   ├── social.js
│       │   ├── stats.js
│       │   ├── tournament_details.js
│       │   ├── tournament.js
│       │   ├── translations.json
│       │   └── user.js
│       ├── sounds
│       │   └── hit.mp3
│       └── templates
│           ├── board.html
│           ├── game.html
│           ├── game_tournament.html
│           ├── home.html
│           ├── login.html
│           ├── privacy.html
│           ├── setup.html
│           ├── signin42.html
│           ├── signup.html
│           ├── social.html
│           ├── stats.html
│           ├── team.html
│           ├── terms.html
│           ├── tournament_details.html
│           ├── tournament.html
│           └── user.html
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
    - Ouvrez votre navigateur et rendez-vous sur **`https://localhost:8443`**.

## Modules et Extensions
### Modules Principaux
  - **`1`.** **`Backend Framework`** : Développement du backend avec **`Django`**.
  - **`2`.** **`User Management`** : Authentification, gestion des profils et historique des matchs.
  - **`3`.** **`Gameplay`** : Personnalisation des règles**.
  - **`4`.** **`Cybersecurity`** : Mise en place de **`2FA`** et **`JWT`**.
  - **`5`.** **`DevOps`** : Gestion des logs avec **`ELK`**.
  
### Modules Bonus
  - **`Accessibilité`** : Compatibilité multi-langue

## Aperçu

  - ### Accueil
  	<div align="center">
     <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/accueil.gif" alt="Accueil_pong">
  	</div>

  - ### Login Signup et 2fa
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/signup_login_2fa.gif" alt="Inscription et authentification">
    </div> 
    
  - ### Authentification avec log in 42
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/login42.gif" alt="Authentification avec log in">
    </div> 

  - ### Interface du jeu
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/home.png" alt="Interface du jeu">
    </div> 
    
  - ### Game
    <div align="center"> <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/2p.gif" alt="Windows Game"> </div>
  
  - ### Statistiques des utilisateurs
    <div align="center"> <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/stats.gif" alt="Statistiques utilisateur"> </div>
    
  - ### Interface utilisateurs et Sécurité
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/user.gif" alt="Interface du jeu">
    </div> 

  - ### Personnalisation et réglages
    <div align="center">
      <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/setup.gif" alt="Personnalisation des avatars et réglages">
    </div>
    
  - ### Tournoi game
    <div align="center"> <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/tournament.gif" alt="Tournois game"> </div>

  - ### Réseau social
    <div align="center"> <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/social.gif" alt="Réseau social"> </div>

  - ### Logs via ELK (Elasticsearch, Logstash, Kibana)
    <div align="center"> <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/Screenshot_log_ELK.png" alt="Log ELK"> </div>

  - ### Team
    <div align="center"> <img src="https://github.com/raveriss/ft_transcendence/blob/main/assets/team.gif" alt="Credits"> </div>
  
## Contributeurs
- [jecointr](https://github.com/jecointr)
- [mmaric](https://github.com/markomrc)
- [ode-cleb](https://github.com/ode-cleb)
- [raveriss](https://github.com/raveriss)
- [sycourbi](https://github.com/Sycourbi)

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
- [Two-Factor Authentication in Django Using Google Authenticator](https://www.youtube.com/watch?v=u02U_ZNd0HU&ab_channel=Neszen)

- [Tuto docker comprendre docker partie #01](https://www.wanadevdigital.fr/23-tuto-docker-comprendre-docker-partie1/)
- [Tuto docker comprendre docker partie #02](https://www.wanadevdigital.fr/24-tuto-docker-demarrer-docker-partie-2/)
- [Tuto docker comprendre docker partie #03](https://www.wanadevdigital.fr/27-tuto-docker-les-commandes-et-docker-partie-3/)

- [PostgreSQL](https://docs.postgresql.fr/)
- [TUTORIALS POSTGRESQL](https://www.youtube.com/watch?v=_LmASWXwdoM&list=PLn6POgpklwWonHjoGXXSIXJWYzPSy2FeJ&ab_channel=xavki)

- [TUTORIALS PROMETHEUS / GRAFANA](https://www.youtube.com/watch?v=wcTr8Hm7SCQ&list=PLn6POgpklwWo3_2pj5Jflqwla62P5OI8n&ab_channel=xavki)

- [TUTORIALS Introduction : why ? what ? - #ELK 01](https://www.youtube.com/watch?v=QmSIml8lo-c&list=PLn6POgpklwWqSvhjguOUJCH8ItydtIvKZ&ab_channel=XavkiEn)


- [ThreeJS](https://threejs.org/docs/index.html#manual/fr/introduction/Creating-a-scene)
- [Tutoriel Pong](https://www.ponggame.org/)
