# LLM Chat Frontend – React + TypeScript Design Documentation

This document describes the **frontend design** of the LLM Chat application, built with **React**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**. It also explains how it interacts with the backend.

---

## 1. Overview

The frontend provides a chat interface allowing users to:

- Send messages to the chatbot
- Upload documents (`.txt`, `.pdf`, `.docx`)
- Fetch webpage content for context
- View chat responses in real-time

The frontend communicates with the backend via **HTTP requests** to these endpoints:

| Action                  | Endpoint                  | Method |
|-------------------------|---------------------------|--------|
| Chat with LLM           | `/api/chat`               | POST   |
| Upload document         | `/api/upload`             | POST   |
| Fetch webpage content   | `/api/fetch_url`          | POST   |

---

## 2. Component Structure

### 2.1 `Home` Component
- **File:** `app/page.tsx` (or `pages/index.tsx`)
- **Responsibilities:**
  - Handle user input for chat, URLs, and file uploads
  - Maintain chat state
  - Render chat messages
  - Trigger backend requests

### 2.2 State Management
- `prompt` – Current chat input
- `messages` – Array of messages `{ from: 'user' | 'llm', text: string }`
- `loading` – Indicates when a request is in progress
- `urlInput` – URL input for webpage fetching
- `endRef` – Reference to scroll chat to bottom automatically

---

## 3. Core Features

### 3.1 Chat Submission
- **Trigger:** User submits message via form
- **Process:**
  1. Add user message to `messages` state
  2. Send POST request to `http://localhost:8000/api/chat` with last messages
  3. Receive LLM response and update `messages`
- **Backend Interaction:** `/api/chat`
- **Error Handling:** Adds `"Error fetching response."` in chat if request fails

### 3.2 URL Fetch
- **Trigger:** User submits a URL via form
- **Process:**
  1. Send POST request to `/api/fetch_url` with URL
  2. Receive confirmation message from backend
  3. Add confirmation message to chat
- **Backend Interaction:** `/api/fetch_url`
- **Error Handling:** Adds `"Failed to fetch URL."` message in chat

### 3.3 File Upload
- **Trigger:** User selects a file using the file input
- **Process:**
  1. Send file via `FormData` POST to `/api/upload`
  2. Receive confirmation message from backend
  3. Add message to chat
- **Backend Interaction:** `/api/upload`
- **Error Handling:** Adds `"Failed to upload file."` message in chat

---

## 4. UI Layout

### 4.1 Header
- Displays the chat title with `MessageSquare` icon
- Fixed height, styled with Tailwind for shadow and padding

### 4.2 Chat Messages
- Scrollable main section (`flex-1 overflow-y-auto`)
- Messages rendered differently based on `from`:
  - **User:** Blue bubble on the right
  - **LLM:** Gray bubble on the left
- Auto-scrolls to bottom on new messages (`endRef`)

### 4.3 Footer
- Contains three forms:
  1. **URL Fetch Form** – input + fetch button
  2. **File Upload Form** – upload button with hidden file input
  3. **Chat Input Form** – textarea + submit button
- Loading spinner displayed on submit while waiting for response

---

## 5. Styling
- **Tailwind CSS**:
  - Flexbox layout
  - Gradient background
  - Rounded message bubbles
  - Focus and hover states for inputs and buttons
- **Lucide Icons** for UI elements:
  - `Send` – Chat submit button
  - `User` – User/LLM avatar
  - `MessageSquare` – Header icon

---

## 6. Backend Interaction Flow

```
flowchart LR
  A[User Input] --> B[Frontend Home Component]
  B --> |Chat Message| C[/api/chat POST]
  B --> |URL| D[/api/fetch_url POST]
  B --> |File| E[/api/upload POST]
  C --> F[Backend FastAPI Chat Endpoint]
  D --> G[Backend FastAPI Fetch URL Endpoint]
  E --> H[Backend FastAPI Upload Endpoint]
  F --> C
  G --> D
  H --> E
  C --> B[Update messages state]
  D --> B[Update messages state]
  E --> B[Update messages state]
```
- User interacts via chat input, URL input, or file upload.
- Frontend sends appropriate request to backend.
- Backend processes request:
  - **Chat:** Combines uploaded docs & webpages, queries OpenAI API
  - **URL fetch:** Scrapes webpage text
  - **File upload:** Extracts text from file
- Backend returns message/response.
- Frontend updates `messages` state and scrolls to bottom.

---

## 7. Error Handling

- Backend errors are caught and displayed as chat messages.
- Frontend disables input during request to prevent multiple submissions.

---

## 8. Future Improvements

- Add context-aware scrolling for large chat history
- Integrate user authentication and sessions
- Add file type validation before upload
- Support multiple OpenAI models selection
- Add rich message formatting (markdown, links)

---

## 9. Conclusion

The frontend is a **single-page React interface** that efficiently handles multiple input types and communicates with the backend. It provides a responsive, modern chat UI while delegating heavy AI processing to the backend.
