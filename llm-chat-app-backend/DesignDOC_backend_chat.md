This backend powers the **arnvLLM chat application**, providing document upload, webpage scraping, and ChatGPT-powered conversational AI.  

It is built with **FastAPI**, supports **file uploads (TXT, PDF, DOCX)**, fetches webpage content, and integrates with the **OpenAI API** to generate responses.  

---

## Features  
- Upload and process documents (`.txt`, `.pdf`, `.docx`)  
- Fetch and extract clean text from webpages  
- Store context in-memory for reference during chat  
- Chat endpoint powered by **OpenAI GPT models**  
- Built-in **CORS support** for frontend integration  

---

## Installation  

### Prerequisites  
- Python 3.9+  
- OpenAI API key  

### Install dependencies  

```bash
pip install fastapi uvicorn httpx PyPDF2 python-docx beautifulsoup4
```

##  API Endpoints

### 1. Upload Document  

**POST** `/api/upload`  

Upload a document (`.txt`, `.pdf`, `.docx`). Extracted text is stored in memory.  

**Request**  
- `multipart/form-data` with a `file` field  

**Example Response**  

```json
{
  "message": "Uploaded example.pdf. You can now ask questions about it."
}
```
### 2. Fetch Webpage Content 
**POST**   `/api/fetch_url`

Fetches webpage text content and stores it for later reference.

**Request**  
```json
{
  "url": "https://example.com"
}
```
**Example Response**  

```json
{
  "message": "Webpage content fetched and stored. You can now ask questions about it."
}
```

### 3. Chat 
**POST**   `/api/chat`

Send chat messages and receive responses based on:

- Uploaded documents

- Webpage content

- Conversation history

**Request**  
```json
{
  "messages": [
    {"from": "user", "text": "What is this document about?"}
  ]
}
```
**Example Response**  

```json
{
  "reply": "This document discusses..."
}
```

## Future Improvements

- Move API key handling to environment variables

- Add database support instead of in-memory storage

- Extend file support (CSV, PPTX, etc.)

- Add user/session management




