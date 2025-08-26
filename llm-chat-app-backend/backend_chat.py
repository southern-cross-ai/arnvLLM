from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Literal
import httpx
import io
import PyPDF2
import docx
from bs4 import BeautifulSoup

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded OpenAI API key
OPENAI_API_KEY = "KEY HERE"
# In-memory stores
uploaded_docs = {}
webpage_contents = {}

# Max characters per document/webpage to avoid 400 errors
MAX_CONTEXT_CHARS = 3000

# Chat Models
class Message(BaseModel):
    from_: Literal['user', 'llm'] = Field(..., alias='from')
    text: str

class ChatRequest(BaseModel):
    messages: List[Message]

# URL Request with scheme validation
class URLRequest(BaseModel):
    url: str

    @validator('url')
    def ensure_scheme(cls, v):
        if not v.startswith(('http://', 'https://')):
            v = 'https://' + v
        return v

# -----------------------------
# Upload document endpoint
# -----------------------------
@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    contents = await file.read()
    text_content = ""

    if file.filename.endswith(".txt"):
        text_content = contents.decode("utf-8")
    elif file.filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(contents))
        text_content = "\n".join(page.extract_text() for page in reader.pages)
    elif file.filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(contents))
        text_content = "\n".join([p.text for p in doc.paragraphs])
    else:
        return {"message": "Unsupported file type"}

    # Limit text length
    uploaded_docs[file.filename] = text_content[:MAX_CONTEXT_CHARS]
    return {"message": f"Uploaded {file.filename}. You can now ask questions about it."}

# -----------------------------
# Fetch webpage content
# -----------------------------
@app.post("/api/fetch_url")
async def fetch_url(request: URLRequest):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(request.url)
            resp.raise_for_status()
            html = resp.text

        # Extract visible text
        soup = BeautifulSoup(html, "html.parser")
        for script in soup(["script", "style"]):
            script.decompose()
        text_content = soup.get_text(separator="\n")
        text_content = "\n".join([line.strip() for line in text_content.splitlines() if line.strip()])

        # Limit text length
        webpage_contents[request.url] = text_content[:MAX_CONTEXT_CHARS]
        return {"message": f"Webpage content fetched and stored. You can now ask questions about it."}
    except httpx.RequestError:
        raise HTTPException(status_code=400, detail="Failed to reach the URL. Check if it's valid.")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=400, detail=f"HTTP error: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unexpected error: {str(e)}")

# -----------------------------
# Chat endpoint
# -----------------------------
@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Combine uploaded docs and webpages, truncate to avoid 400
    context_text = "\n".join(uploaded_docs.values()) + "\n" + "\n".join(webpage_contents.values())
    if len(context_text) > MAX_CONTEXT_CHARS:
        context_text = context_text[-MAX_CONTEXT_CHARS:]  # take last part

    system_prompt = f"You are JoeyLLM, an AI assistant. Use the following documents and webpages to answer questions:\n{context_text}"

    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.messages[-5:]:
        role = "user" if msg.from_ == "user" else "assistant"
        api_messages.append({"role": role, "content": msg.text})

    payload = {"model": "gpt-3.5-turbo", "messages": api_messages}
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as e:
        return {"reply": f"OpenAI API error: {e.response.status_code}"}
    except Exception as e:
        return {"reply": f"Unexpected error: {str(e)}"}

    reply = data.get("choices", [{}])[0].get("message", {}).get("content", "No response")
    return {"reply": reply}

# -----------------------------
# Run backend
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

