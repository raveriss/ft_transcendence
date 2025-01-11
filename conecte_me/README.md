# Conecte Me

Conecte Me is a single-page web application that integrates OAuth 2.0 authentication with 42. This project uses Django for the backend, PostgreSQL for the database, and Docker for deployment. The frontend is designed to be minimalist, featuring a "Continue with 42" button for user authentication.

## Project Structure

```
conecte-me
├── backend
│   ├── conecte_me
│   ├── app
│   ├── manage.py
│   └── requirements.txt
├── frontend
│   ├── index.html
│   ├── css
│   └── js
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .gitignore
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