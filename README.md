# CampusConnect - Management Information System

This is a Next.js application designed as a Management Information System (MIS) for an educational institution, featuring distinct interfaces for Admin, Teachers, and Students. It uses a PHP backend with a MySQL database.

## Project Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Database Setup:**
    *   Ensure you have a MySQL server running.
    *   Create a database named `campus_connect_db`.
    *   Update the database credentials in `src/api/config/database.php`. **It is highly recommended to use environment variables for sensitive information in production.**
    *   Import the necessary table structures. You can use the `CREATE TABLE` statements found within `src/database/schema.sql` (or individual model files if schema.sql doesn't exist) or your existing database schema if applicable.
    *   **Seed the database:** Run the SQL commands in `src/database/seed.sql` to create the default admin user and potentially other initial data like subjects.
        *   **Important:** The `seed.sql` file contains a **placeholder password hash** for the default admin user (`admin` / `defadmin`). You **must** generate a secure hash for 'defadmin' using PHP's `password_hash()` function and replace the placeholder in the `seed.sql` file before running it.
            *   Example PHP command: `php -r "echo password_hash('defadmin', PASSWORD_DEFAULT);"`
            *   Copy the output hash and paste it into the `INSERT` statement in `seed.sql`.

4.  **Configure API Base URL:**
    *   The frontend makes requests to the PHP backend. The base URL is defined in `src/lib/api.ts`. By default, it's set to `http://localhost:8000`.
    *   Ensure this matches the address and port where your PHP development server will run. You can modify this constant or use environment variables (`NEXT_PUBLIC_API_BASE_URL`).

5.  **Run PHP Development Server:**
    *   Navigate to the root directory of your project in your terminal.
    *   Start the PHP built-in server, pointing its document root to the `src/api` directory:
        ```bash
        php -S localhost:8000 -t src/api
        ```
    *   *(Adjust `localhost:8000` if you configured a different URL/port in `src/lib/api.ts`)*

6.  **Run Next.js Development Server:**
    *   In a **separate terminal**, navigate to the project root directory.
    *   Start the Next.js development server:
        ```bash
        npm run dev
        ```
    *   This usually runs on `http://localhost:9002` (or the port specified in `package.json`).

7.  **Access the Application:**
    *   Open your browser and go to `http://localhost:9002` (or your Next.js development server address).
    *   You should see the login page.

## Default Login Credentials

*   **Admin:**
    *   Username: `admin`
    *   Password: `defadmin` (or the password you set and hashed in `seed.sql`)
*   **Student/Teacher:** Default credentials are typically generated upon creation (e.g., first two letters of last name + '1000').

## Folder Structure

*   `src/app/`: Next.js App Router pages and layouts.
    *   `admin/`: Admin-specific pages and layout.
    *   `student/`: Student-specific pages and layout.
    *   `teacher/`: Teacher-specific pages and layout.
    *   `api/`: Catch-all route handler (placeholder, actual API is PHP).
    *   `login/`: Login page.
    *   `forgot-password/`: Forgot password page.
*   `src/components/`: Reusable React components (UI elements, forms, layout components).
*   `src/lib/`: Utility functions, validation schemas (`schemas.ts`), API helpers (`api.ts`).
*   `src/hooks/`: Custom React hooks.
*   `src/types/`: TypeScript type definitions (`index.ts`).
*   `src/api/`: **PHP Backend Code**
    *   `config/`: Database configuration (`database.php`).
    *   `models/`: PHP classes representing data structures (e.g., `student.php`, `teacher.php`, `admin.php`).
    *   `admin/`, `student/`, `teacher/`: Subdirectories for role-specific API endpoints.
    *   Endpoint files (e.g., `students/read.php`, `login.php`).
*   `src/database/`: SQL files for database schema (`schema.sql`) and seeding (`seed.sql`).
*   `public/`: Static assets.
*   `styles/`: Global CSS (`globals.css`).

## Key Technologies

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
*   **Backend:** PHP (using PDO for database interaction)
*   **Database:** MySQL

## Available Scripts

*   `npm run dev`: Starts the Next.js development server (usually on port 9002).
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the production Next.js server.
*   `npm run lint`: Lints the code using Next.js's built-in ESLint configuration.
*   `npm run typecheck`: Runs TypeScript type checking.
*   `php -S localhost:8000 -t src/api`: (Run separately) Starts the PHP development server for the backend API.

## Important Notes

*   **Security:** The provided PHP code is a basic structure. For production, implement robust authentication (e.g., JWT or sessions), authorization, proper input validation/sanitization, and error handling. Use prepared statements (like PDO does) to prevent SQL injection. Never expose database credentials directly in code; use environment variables.
*   **CORS:** Ensure your PHP backend sends the correct `Access-Control-Allow-Origin` header to allow requests from your Next.js frontend origin (e.g., `http://localhost:9002`). The current `*` is permissive for development but should be restricted in production.
*   **Error Handling:** Enhance error handling on both frontend and backend for a better user experience.
*   **State Management:** For more complex state needs, consider integrating a state management library (like Zustand, Redux Toolkit, or Jotai).

