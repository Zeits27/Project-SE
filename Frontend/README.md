# Frontend Folder Overview

This folder contains the frontend source code and related files for the project, structured as follows:
1. .vite
Automatically created when initializing a new Vite project. It stores Vite’s internal build cache and configuration data.
2. public
Contains static assets like the default Vite icons and any other files you want to serve directly (e.g., favicon, robots.txt).
3. src
The main source folder of the React application, including:
- assets: Contains images and static files such as the website logo.
- components: Reusable UI elements and templates for pages or sections.
- pages: Contains React components representing individual pages.
- utils: Utility functions and context providers, such as AuthContext and route guards for authentication.
- App.jsx: Defines the main app structure and routing between pages.
- index.css: Global styles, including Tailwind CSS imports and custom styles.
- main.jsx: The entry point of the React application, where the app is bootstrapped and rendered.
4. Other files
Configuration and support files such as eslint.config.js that help with linting and overall project setup.
