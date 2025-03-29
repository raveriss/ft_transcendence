# Conecte Me

Conecte Me is a single-page web application that integrates OAuth 2.0 authentication with 42. This project uses Django for the backend, PostgreSQL for the database, and Docker for deployment. The frontend is designed to be minimalist, featuring a "Continue with 42" button for user authentication.

## Project Structure

```
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
│   ├── home.html
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

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd conecte-me
   ```

2. **Configure the PostgreSQL database:**
   Update the `settings.py` file in the `backend/conecte_me` directory with your PostgreSQL database credentials.

3. **Install Docker:**
   Ensure you have Docker and Docker Compose installed on your machine.

4. **Build and run the application:**
   ```
   docker-compose up --build
   ```

5. **Access the application:**
   Open your web browser and navigate to `https://localhost/`.

## Usage

Click the "Continue with 42" button on the frontend to initiate the OAuth 2.0 authentication process. Follow the prompts to log in with your 42 account.

## Testing

To run tests, navigate to the backend directory and use the following command:
```
python manage.py test
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.