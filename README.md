# DocScribe

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

<img width="1839" height="826" alt="image" src="https://github.com/user-attachments/assets/511eaadb-e81e-43da-9f03-3de9969ca49e" />


> AI-powered document summarization platform that transforms lengthy documents into concise, actionable insights using advanced language models.

[Live Demo](https://doc-scribe-frontend.vercel.app) · [Report Bug](https://github.com/Obomhese-Raphael/DocScribe/issues) · [Request Feature](https://github.com/Obomhese-Raphael/DocScribe/issues)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Overview

DocScribe is a full-stack web application that leverages cutting-edge AI technology to provide intelligent document summarization. Built with the MERN stack and powered by Groq's ultra-fast inference engine, it enables users to quickly extract key insights from documents, saving time and improving productivity.

### Why DocScribe?

- **⚡ Lightning Fast**: Powered by Groq's inference engine for near-instantaneous summaries
- **🔒 Secure**: Enterprise-grade authentication with Clerk
- **📱 Responsive**: Seamless experience across all devices
- **💾 Persistent**: Complete history tracking and document management
- **🎨 Modern**: Built with the latest web technologies and best practices

---

## ✨ Key Features

### Core Functionality
- **Multi-Format Support**: Upload and summarize PDF, TXT, and DOCX files
- **AI-Powered Summarization**: Leverages Groq's LLaMA models for intelligent text analysis
- **Real-time Processing**: Get summaries in seconds, not minutes
- **Document Management**: Complete CRUD operations for your documents
- **Search & Filter**: Quickly find specific documents in your history

### User Experience
- **Drag & Drop Upload**: Intuitive file upload interface
- **Inline Editing**: Rename documents directly in the interface
- **Share Summaries**: Generate shareable links for collaboration
- **Download Options**: Export summaries as text files
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Security & Authentication
- **Secure Authentication**: Clerk integration for user management
- **Protected Routes**: Role-based access control
- **Data Encryption**: Secure storage of sensitive information
- **Session Management**: Automatic token refresh and validation

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks and modern patterns |
| **TypeScript** | Type-safe development and better DX |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Router** | Client-side routing and navigation |
| **Axios** | HTTP client for API communication |
| **React Toastify** | User-friendly notifications |
| **Lucide React** | Modern, customizable icon library |
| **React Dropzone** | File upload with drag-and-drop |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Fast, minimalist web framework |
| **MongoDB** | NoSQL database for flexible data storage |
| **Mongoose** | Elegant MongoDB object modeling |
| **Groq SDK** | AI-powered text summarization |
| **Clerk SDK** | User authentication and management |
| **Multer** | Multipart file upload handling |
| **Mammoth** | DOCX to text conversion |
| **pdf-parse** | PDF text extraction |

### DevOps & Infrastructure
- **Vercel**: Frontend and backend hosting
- **MongoDB Atlas**: Cloud database service
- **Git & GitHub**: Version control and collaboration
- **ESLint & Prettier**: Code quality and formatting

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  TypeScript  │  │   Tailwind   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                          Axios HTTP
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Express    │  │  Middleware  │  │    Routes    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
┌───────────────────▼─────┐   ┌──────────▼──────────────────┐
│      Data Layer          │   │    External Services        │
│  ┌──────────────┐        │   │  ┌──────────────┐          │
│  │   MongoDB    │        │   │  │  Groq API    │          │
│  │   (Mongoose) │        │   │  │  Clerk Auth  │          │
│  └──────────────┘        │   │  └──────────────┘          │
└──────────────────────────┘   └─────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **MongoDB** account ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Obomhese-Raphael/DocScribe.git
   cd DocScribe
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docscribe?retryWrites=true&w=majority

# Authentication (Clerk)
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# AI Service (Groq)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Frontend URL
FRONTEND_BASE_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

#### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Environment
VITE_NODE_ENV=development
```

### Running Locally

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Access the Application

Open your browser and navigate to `http://localhost:5173`

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Create `vercel.json` in the frontend root:**
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. **Deploy to Vercel:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `VITE_API_BASE_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`

### Backend Deployment (Vercel)

1. **Ensure `vercel.json` exists in the backend root:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

2. **Deploy to Vercel:**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - All variables from backend `.env` file

### Post-Deployment

- Update `FRONTEND_BASE_URL` in backend environment variables
- Update `VITE_API_BASE_URL` in frontend environment variables
- Test all functionality in production environment
- Monitor logs for any errors

---

## 📚 API Documentation

### Base URL
```
Production: https://your-backend.vercel.app
Development: http://localhost:5000
```

### Authentication
All protected routes require a valid Clerk session token in the `Authorization` header:
```
Authorization: Bearer <clerk_session_token>
```

### Endpoints

#### Document Upload & Summarization
```http
POST /api/upload
Content-Type: multipart/form-data

Body:
  file: <binary>

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "document_id",
    "originalName": "example.pdf",
    "summary": "AI-generated summary...",
    "fileType": "application/pdf",
    "uploadDate": "2026-02-05T10:30:00.000Z"
  }
}
```

#### Get Summary History
```http
GET /api/summaries/history

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "summary_id",
      "documentId": "document_id",
      "summaryText": "Summary content...",
      "summaryDate": "2026-02-05T10:30:00.000Z",
      "document": {
        "_id": "document_id",
        "originalName": "example.pdf",
        "fileType": "application/pdf"
      }
    }
  ]
}
```

#### Generate Share Link
```http
POST /api/summaries/:id/share

Response: 200 OK
{
  "success": true,
  "shareableLink": "https://your-app.vercel.app/shared/document_id"
}
```

#### Get Shared Summary
```http
GET /api/summaries/shared/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "document_id",
    "summaryText": "Summary content...",
    "document": {
      "originalName": "example.pdf",
      "fileType": "application/pdf"
    }
  }
}
```

#### Download Summary
```http
GET /api/summaries/:id/download

Response: 200 OK
Content-Type: text/plain
Content-Disposition: attachment; filename="summary.txt"
```

#### Delete Summary
```http
DELETE /api/summaries/:id

Response: 200 OK
{
  "success": true,
  "message": "Summary deleted successfully"
}
```

#### Rename Document
```http
PATCH /api/upload/documents/:id/rename
Content-Type: application/json

Body:
{
  "newName": "Updated Document Name.pdf"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "document_id",
    "originalName": "Updated Document Name.pdf"
  }
}
```

---

## 📁 Project Structure

```
DocScribe/
├── frontend/
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── History.tsx
│   │   │   ├── SharedSummary.tsx
│   │   │   └── About.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── utils/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── vercel.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── controllers/
│   │   ├── uploadController.js
│   │   └── summaryController.js
│   ├── models/
│   │   ├── Document.js
│   │   └── User.js
│   ├── routes/
│   │   ├── uploadRoutes.js
│   │   └── summaryRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validateFile.js
│   ├── utils/
│   │   ├── groqService.js
│   │   └── fileParser.js
│   ├── config/
│   │   └── database.js
│   ├── uploads/
│   ├── .env
│   ├── vercel.json
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Process

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run test
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Wait for review

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Contact

**Obomhese Raphael**

- 🐦 Twitter: [@ObomheseR](https://twitter.com/ObomheseR)
- 📧 Email: obomheser@gmail.com
- 💼 LinkedIn: [Obomhese Raphael](https://linkedin.com/in/obomhese-raphael)
- 🐙 GitHub: [@Obomhese-Raphael](https://github.com/Obomhese-Raphael)

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing ultra-fast AI inference
- [Clerk](https://clerk.com/) for seamless authentication
- [MongoDB](https://www.mongodb.com/) for flexible data storage
- [Vercel](https://vercel.com/) for hosting and deployment
- The open-source community for amazing tools and libraries

---

<div align="center">

**[⬆ Back to Top](#docscribe)**

Made with ❤️ by [Obomhese Raphael](https://github.com/Obomhese-Raphael)

</div>
