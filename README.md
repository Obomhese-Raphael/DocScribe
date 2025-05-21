# DocScribe - AI-Powered Document Summarization

DocScribe is a fullstack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js), enhanced by Vite for a fast development experience and TypeScript for type safety. It leverages the power of Hugging Face's transformer models for intelligent text summarization and Clerk for seamless user authentication. The application allows users to easily summarize various documents and texts, extracting key information quickly and efficiently.

## Key Features

* **Effortless Document Input:** Users can input text directly or provide links to online documents for summarization.
* **Intelligent Summarization with Hugging Face:** Utilizes state-of-the-art transformer models from the Hugging Face library to generate concise and coherent summaries.
* **Secure User Authentication:** Implemented with Clerk for secure and easy user sign-up and login.
* **Data Persistence with MongoDB:** Stores user data and summarization history using MongoDB with Mongoose for elegant data modeling.
* **Modern Frontend with Vite and TypeScript:** Built with React.js and TypeScript, bundled with Vite for lightning-fast development and optimized builds.
* **Intuitive User Interface:** Clean and user-friendly design enhanced with beautiful icons from Lucide React and React Icons.
* **Responsive Design:** Works seamlessly across various devices and screen sizes.

## Tech Stack

* **Frontend:**
    * React.js
    * TypeScript
    * Tailwindcss
    * Vite
    * Clerk (for authentication)
    * Lucide React / React Icons (for icons)
    * React Dropzone
    * React Toastify
    * React DOM
* **Backend:**
    * Node.js
    * Express.js
    * Mongoose (for MongoDB interaction)
    * Hugging Face Transformers library ([`@huggingface/inference`](https://huggingface.co/docs/inference-api/js-client))
    * Axios
    * Cors
    * mammoth
    * multer - File Storage
    * dotenv
* **Database:**
    * MongoDB

## Getting Started

Follow these steps to get DocScribe running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Obomhese-Raphael/DocScribe.git
    cd DocScribe
    cd frontend / backend
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install  # or yarn install
    ```

3.  **Set up backend environment variables:**
    * Create a `.env` file in the `backend` directory.
    * Add your MongoDB connection URI (`MONGODB_URI`), Clerk secret key (`CLERK_SECRET_KEY`), and any other necessary environment variables (e.g., Hugging Face API token if required for specific models).
    ```env - Backend
    MONGODB_URI=your_mongodb_connection_string
    CLERK_WEBHOOK_SECRET=your_clerk_secret_key
    HUGGINGFACE_API_KEY=your_huggingface_api_token (if needed)
    PORT=5000 # Or your preferred backend port
    VITE_BACKEND_URL = http://localhost:5000
    CLERK_SECRET_KEY=your_clerk_secret_key
    NODE_ENV = development
    ```

    ```env - Frontend
    VITE_CLERK_PUBLISHABLE_KEY= ,
    CLERK_SECRET_KEY= ,
    VITE_API_BASE_URL = ,
    VITE_API_BASE_URL_DEV=http://localhost:5000
    ```

4.  **Start the backend server:**
    ```bash
    npm run server  # or yarn dev (if you have a dev script in package.json)
    ```

5.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install  # or yarn install
    ```

6.  **Set up frontend environment variables:**
    * Create a `.env.local` file in the `frontend` directory.
    * Add your Clerk frontend API key (`VITE_CLERK_PUBLISHABLE_KEY`) and the backend API base URL (`VITE_API_BASE_URL`).
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_API_BASE_URL=http://localhost:5000/api # Adjust if your backend runs on a different port
    ```

7.  **Start the frontend development server:**
    ```bash
    npm run dev  # or yarn dev
    ```

8.  Open your browser and navigate to `http://localhost:5173` (or the port Vite assigns).

## Deployment

You can deploy DocScribe to platforms like Vercel (for the frontend and potentially the backend if using serverless functions) and other Node.js hosting providers (for the backend). Refer to the documentation of these platforms for specific deployment instructions.

**Important for Vercel:**

* Ensure you set up the necessary environment variables (MongoDB URI, Clerk Secret Key, etc.) in your Vercel project settings.
* Configure your Vercel project to build both the frontend and backend if they are in the same repository. You might need separate Vercel projects for the frontend and backend for more complex setups.

## Contact

Feel free to reach out if you have any questions, suggestions, or just want to connect!

* **Twitter (X):** [ObomheseR](https://x.com/ObomheseR?t=uFit-R7ov-RwEXjtazS0Q&s=09)
* **Mail:** [obomheser@gmail.com](mailto:obomheser@gmail.com)
* **GitHub:** [Obomhese Raphael](https://github.com/Obomhese-Raphael)
* **LinkedIn:** [Obomhese Raphael](https://www.linkedin.com/in/obomheser?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)
