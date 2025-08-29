
# ArtisTech E-Commerce Platform

ArtisTech is a full-stack e-commerce platform for visual artists, built with Node.js, Express, React, and MySQL.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [XAMPP](https://www.apachefriends.org/index.html) (we will only use this for its **MySQL Database** and **phpMyAdmin**)
- [ngrok](https://ngrok.com/download)

### 1. Clone the Repository

First, clone the project from its source repository to your local machine:

```bash
git clone <your-repository-url>
cd ArtisTech
```

### 2. Database Setup with XAMPP

Your entire database will be managed by XAMPP's MySQL server.

1.  **Start XAMPP:** Open the XAMPP Control Panel and start the **MySQL** module.
2.  **Create the Database:**
    -   Open your web browser and navigate to `http://localhost/phpmyadmin`.
    -   Click on the "New" button on the left sidebar.
    -   Enter the database name `artistech_db` and click "Create".
3.  **Import the Database Data:**
    -   Select the `artistech_db` database in phpMyAdmin.
    -   Click on the "Import" tab at the top.
    -   Click "Choose File" and select the `artistech_db_backup.sql` file located in the root of the project folder.
    -   Click "Go" at the bottom of the page to start the import. Once it's done, your database is ready.

### 3. Backend Setup

The backend is a Node.js server that will connect to your XAMPP database.

1.  **Navigate to the backend directory:**
    ```bash
    cd artistech-backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:**
    Create a `.env` file in the `artistech-backend` directory. Copy and paste the content below. These settings are pre-configured for a default XAMPP installation.

    ```env
    PORT=3000
    NODE_ENV=development
    FRONTEND_URL=http://localhost:5173

    # Database Configuration for XAMPP
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=artistech_db

    # Security
    JWT_SECRET=your_jwt_secret
    SESSION_SECRET=your_session_secret

    # PayMongo API Keys
    PAYMONGO_PUBLIC_KEY=your_paymongo_public_key
    PAYMONGO_SECRET_KEY=your_paymongo_secret_key
    PAYMONGO_WEBHOOK_SECRET=your_paymongo_webhook_secret
    
    # File Upload Configuration
    MAX_FILE_SIZE=10485760
    ALLOWED_FILE_TYPES=jpeg,jpg,png,gif,webp
    ```
    *Note: Remember to fill in your actual secret keys for JWT, Session, and PayMongo.*

### 4. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../artistech-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### 5. Running the Application

Now you will start the two separate servers for the backend and frontend.

1.  **Pre-flight Check:** Make sure the **MySQL** module is still running in your XAMPP Control Panel.
    > **Important Note:** We do **not** use the Apache server from XAMPP. Your application runs on Node.js servers, not Apache.

2.  **Start the Backend Server:**
    From the `artistech-backend` directory, run:
    ```bash
    npm run start:dev
    ```
    Your backend API is now running. This will also start `ngrok` to handle payment webhooks.

3.  **Start the Frontend Server:**
    Open a **new terminal window**. From the `artistech-frontend` directory, run:
    ```bash
    npm run dev
    ```
    The application will now be accessible at `http://localhost:5173`.

### Ngrok Setup

The project uses `ngrok` to expose your local backend to the internet, which is necessary for PayMongo webhooks.

1.  **Sign up for ngrok:**
    If you don't have an account, sign up at [ngrok.com](https://ngrok.com/).

2.  **Install your authtoken:**
    Follow the instructions on your ngrok dashboard. This is a one-time setup.
    ```bash
    ngrok config add-authtoken <your-auth-token>
    ```

The `start:dev` script in the backend will automatically handle starting `ngrok` for you.
