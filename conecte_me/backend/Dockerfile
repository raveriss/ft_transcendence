# Utiliser une image Python légère
FROM python:3.10-alpine

# Créer un répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk update && apk add --no-cache \
    postgresql-client \              
    postgresql-dev \                 
    gcc \                            
    musl-dev \                       
    libffi-dev \                     
    openssl-dev \                    
    zlib-dev \                       
    jpeg-dev \                       
    freetype-dev \                   
    lcms2-dev \                      
    tiff-dev \                       
    py3-pip \                        
    python3-dev \                    
    build-base \                     
    curl \                           
    bash                            


# Copier les fichiers de configuration
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Nettoyer le cache pour réduire la taille de l'image
RUN apk del gcc musl-dev libffi-dev openssl-dev && rm -rf /var/cache/apk/*

# Copier le code source du backend
COPY . /app

# copie le script dans le conteneur
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Exposer le port 8000
EXPOSE 8000

# Lancer le serveur Django
CMD ["sh", "-c", "while ! nc -z db 5432; do sleep 1; done; python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
