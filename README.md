# arnvLLM – Chat Application  

This project provides a simple chat interface powered by a backend (`backend_chat.py`) that integrates with the ChatGPT API.  

## Getting Started  

### Prerequisites  
- **Node.js & npm** (for the frontend)  
- **Python 3.9+** (for the backend)  
- **Uvicorn & FastAPI** (for serving the backend)  

### Installation & Setup  

#### 1. Frontend  
Open a terminal and navigate to the project root directory (`llm-chat-app`):  

```bash
cd llm-chat-app
```

Install dependencies (only needed the first time):

```bash
npm install
```
Start the frontend development server:
```bash
npm run dev
```
The terminal will display a local development URL (e.g., http://localhost:3000).



#### 2. Backend
In a second terminal, from the same project root, run:

```bash
uvicorn backend_chat:app --reload
```
This will start the backend server with live reloading enabled.

###  Using the Application

1. Make sure both the frontend and backend servers are running.

2. Open the frontend URL provided in the first terminal.

3. You can now interact with the chatbot.
