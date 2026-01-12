# Intelligent RCA Management System

An advanced platform for conducting, managing, and analyzing Root Cause Analysis (RCA) reports. This system leverages AI to assist engineers in debugging issues, finding similar past incidents, and automating data entry from PDF reports.

## 🏗 Software Architecture

The application follows a modern **Client-Server Architecture** using the MERN stack (MongoDB, Express.js, React, Node.js), enhanced with Generative AI capabilities.

### System Diagram

```mermaid
graph TD
    User[User] -->|Interacts| Client[Frontend (React + Vite)]
    Client -->|HTTP/REST| API[Backend API (Express.js)]
    
    subgraph "Backend Services"
        API -->|Controllers| RCAController[RCA Logic]
        RCAController -->|Data Access| DB[(MongoDB)]
        RCAController -->|Smart Debug| AIService[AI Service (Gemini)]
        RCAController -->|File Process| PDFParser[PDF Parser]
    end
    
    subgraph "External Integration"
        AIService -->|Prompts| Gemini[Google Gemini API]
    end
```

### Component Breakdown

1.  **Frontend (Client Layer)**
    *   **Framework**: React (powered by Vite) for a fast, reactive user interface.
    *   **State Management**: React Hooks (`useState`, `useEffect`) manage local state and API data.
    *   **Routing**: `react-router-dom` handles navigation between Dashboard, Create/Edit, and Detail views.
    *   **Notifications**: `react-hot-toast` provides modern, non-blocking user feedback.
    *   **Styling**: Custom CSS variables for a premium, consistent dark-themed design system.

2.  **Backend (Server Layer)**
    *   **Runtime**: Node.js with Express.js framework.
    *   **API Design**: RESTful architecture defining endpoints for RCAs (`GET`, `POST`, `PUT`, `DELETE`).
    *   **File Handling**: `multer` middleware processes PDF file uploads for parsing.

3.  **Data Persistence (Database Layer)**
    *   **Database**: MongoDB (NoSQL) stores flexible RCA documents.
    *   **ODM**: Mongoose defines schemas and handles validation for data integrity.

4.  **Intelligence Layer (AI & Processing)**
    *   **Generative AI**: Google's Gemini Pro model analyzes error logs and search queries to provide actionable debugging steps and correlate related incidents.
    *   **PDF Parsing**: A custom Regex-based parsing engine extracts structured fields (Problem, Root Causes, Actions, Status) from unstructured PDF text.

---

## 🚀 How It Works

### 1. Data Flow & Communication
*   **The Frontend acts as the control center.** When a user creates an RCA or searches for an issue, the React app sends an asynchronous HTTP request (via `axios`) to the Express backend.
*   **The Backend routes the request** to the appropriate controller function.
    *   *Example*: A request to `POST /api/rca/smart-debug` triggers the AI analysis flow.
*   **The Controller orchestrates the logic.** It may query the MongoDB database for historic data, call the AI service to generate a response, or parse an uploaded file.

### 2. Key Modules

*   **Smart Debug Assistant**:
    *   **Input**: User pastes an error log or problem description.
    *   **Process**: The system retrieves context from *all* existing RCAs in the database to see if this has happened before. It then constructs a prompt sending the new error + context to Gemini.
    *   **Output**: The AI returns a structured analysis suggesting potential fixes and highlighting relevant past RCAs.

*   **PDF Import Engine**:
    *   **Input**: User uploads a PDF report.
    *   **Process**: `pdf-parse` extracts raw text. The custom parser applies strict "lookahead patterns" to identify sections like "Description:", "Root Cause:", and "Action:".
    *   **Output**: The system auto-fills the creation form, reducing manual data entry.

*   **RCA Lifecycle Management**:
    *   Users can Create, Read, Update, and Delete (CRUD) RCAs.
    *   **Deletion**: A modern, custom modal UI ensures accidental deletions are prevented.

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite | Core UI Library & Build Tool |
| **Styling** | Vanilla CSS, Lucide React | Custom Design System & Icons |
| **Backend** | Node.js, Express | Server Runtime & API Framework |
| **Database** | MongoDB, Mongoose | NoSQL Database & Object Modeling |
| **AI** | Google Gemini SDK | Generative AI for Logic/Debugging |
| **Utilities** | PDF-parse, React Hot Toast | File Parsing & Notifications |

---

## 🚦 Setup & Installation

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Running locally or a cloud Atlas URI)
*   Google Gemini API Key

### 1. Backend Setup
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    *   Create a `.env` file in the `server` folder.
    *   Add your keys:
        ```env
        PORT=5001
        MONGO_URI=mongodb://localhost:27017/rca_db
        GEMINI_API_KEY=your_google_gemini_api_key
        ```
4.  Start the server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser at `http://localhost:5173` (or the port shown in terminal).

---

## ✨ Key Features
*   **AI-Powered Debugging**: Get instant analysis and fixes for your errors.
*   **Smart Similarity Search**: Automatically finds related incidents as you type.
*   **PDF to Form**: Convert static PDF reports into editable database entries.
*   **Structured RCA Data**: Track Problems, Root Causes (5 Whys), Actions, Tags, and Status.
*   **Modern UI/UX**: Dark mode, glassmorphism effects, and responsive design.
