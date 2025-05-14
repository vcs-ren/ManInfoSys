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
    *   Create a database named `campus_connect_db` (or the name specified in `src/api/config/database.php`).
    *   Update the database credentials in `src/api/config/database.php` if they differ from the defaults (`root` with no password). **It is highly recommended to use environment variables for sensitive information in production.**
    *   **Import the database schema:** Execute the SQL commands in `src/database/schema.sql` to create all necessary tables. You can use a MySQL client like phpMyAdmin, DBeaver, or the MySQL command-line tool.
        ```bash
        mysql -u your_mysql_user -p campus_connect_db < src/database/schema.sql
        ```
    *   **Seed the database:**
        *   **CRITICAL STEP FOR ADMIN LOGIN:** Before running `seed.sql`, you **MUST** generate a secure password hash for the default admin's password ('defadmin') and update the `seed.sql` file.
            1.  Open a PHP interactive shell by typing `php -a` in your terminal, or create a temporary PHP file (e.g., `hash_password.php`) with the following content:
                ```php
                <?php
                echo password_hash('defadmin', PASSWORD_DEFAULT);
                ?>
                ```
                Then run it: `php hash_password.php`
            2.  Copy the entire output string (it will look something like `$2y$10$...`).
            3.  Open `src/database/seed.sql`.
            4.  Find the line: `('admin', '!!!REPLACE_THIS_WITH_GENERATED_PASSWORD_HASH!!!', ...)`
            5.  Replace `!!!REPLACE_THIS_WITH_GENERATED_PASSWORD_HASH!!!` with the hash you copied.
        *   After updating the hash, run the SQL commands in `src/database/seed.sql` to create the default admin user and other initial data like sample programs and courses.
            ```bash
            mysql -u your_mysql_user -p campus_connect_db < src/database/seed.sql
            ```

4.  **Configure API Base URL:**
    *   The frontend makes requests to the PHP backend. The base URL is defined in `src/lib/api.ts` (variable `API_BASE_URL`). By default, it's set to `http://localhost:8000`.
    *   Ensure this matches the address and port where your PHP development server will run. You can modify this constant or use an environment variable (`NEXT_PUBLIC_API_BASE_URL`).

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

*   **Admin (Super Admin):**
    *   Username: `admin`
    *   Password: `defadmin` (after you've correctly hashed and seeded it)
*   **Student/Teacher:** Credentials are automatically generated when they are added through the Admin panel.
    *   Username format: `s<student_id>` for students, `t<teacher_id>` or `a<teacher_id>` for faculty.
    *   Default password format: `@<FirstTwoLettersOfLastNameUpperCase>1001` (e.g., `@SM1001` for Smith). Users will be prompted or should change this upon first login.

## Folder Structure

*   `src/app/`: Next.js App Router pages and layouts.
    *   `admin/`, `student/`, `teacher/`: Role-specific interfaces.
    *   `api/`: Next.js catch-all API route (placeholder - actual API is PHP).
    *   `login/`, `forgot-password/`: Authentication pages.
*   `src/components/`: Reusable React components.
*   `src/lib/`: Utility functions (`utils.ts`), validation schemas (`schemas.ts`), API helpers (`api.ts`).
*   `src/hooks/`: Custom React hooks.
*   `src/types/`: TypeScript type definitions.
*   `src/api/`: **PHP Backend Code**
    *   `config/`: Database configuration (`database.php`).
    *   `models/`: PHP classes representing data models and business logic.
    *   Role-specific endpoint directories (e.g., `admin/`, `students/`, `teachers/`).
*   `src/database/`: SQL files for database schema (`schema.sql`) and seeding (`seed.sql`).
*   `public/`: Static assets.
*   `app/globals.css`: Global CSS and Tailwind base styles/theme.

## Key Technologies

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
*   **Backend:** PHP (using PDO for database interaction)
*   **Database:** MySQL

## Available Scripts

*   `npm run dev`: Starts the Next.js development server (usually on port 9002).
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the production Next.js server.
*   `npm run lint`: Lints the code.
*   `npm run typecheck`: Runs TypeScript type checking.
*   `php -S localhost:8000 -t src/api`: (Run separately) Starts the PHP development server for the backend API.

## Important Notes

*   **Security:** The provided PHP code is a basic structure. For production, implement robust authentication (e.g., JWT or more secure session management), authorization, proper input validation/sanitization (beyond basic `htmlspecialchars`), and comprehensive error handling. Always use prepared statements (as PDO does) to prevent SQL injection. Never expose database credentials directly in code; use environment variables.
*   **CORS:** Ensure your PHP backend sends the correct `Access-Control-Allow-Origin` header. The current `*` is permissive for development but **must** be restricted to your frontend domain(s) in production.
*   **Error Handling:** Enhance error handling on both frontend and backend for a better user experience and easier debugging.
*   **State Management:** For more complex global state needs, consider integrating a state management library like Zustand, Redux Toolkit, or Jotai.
*   **PHP Backend Development:** The PHP backend is structured with model classes and individual endpoint scripts. It's a procedural approach for simplicity in this context. For larger applications, consider using a PHP framework (e.g., Laravel, Symfony).
*   **Password Management:** Users should be encouraged or forced to change their auto-generated passwords upon first login. Implement proper password recovery mechanisms if needed beyond the current "contact admin" approach.
