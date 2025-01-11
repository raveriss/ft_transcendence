FROM nginx:alpine

WORKDIR /usr/share/nginx/html
COPY index.html .
COPY static ./static

# Nginx par défaut écoute sur le port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
