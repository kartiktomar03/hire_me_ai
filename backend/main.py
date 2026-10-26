import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse # 🔥 NAYA IMPORT FOR STREAMING
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
from pypdf import PdfReader
from contextlib import asynccontextmanager

load_dotenv()

my_api_key = os.getenv("GROQ_API_KEY")
if not my_api_key:
    raise ValueError("API KEY ERROR")

client = Groq(api_key=my_api_key)
model = "openai/gpt-oss-120b"

PDF_PATH = Path("kartik_tomar_resume.pdf")
JSON_SAVE_PATH = Path("parsed_resume.json")
resume_data = None 

# ==========================================
# 1. PYDANTIC MODELS 
# ==========================================
class Experience(BaseModel):
    company: str | None = None
    role: str | None = None
    duration: str | None = None
    description: str | None = None
    skills_used: list[str] | None = None

class Resume(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    total_experience: float | None = None
    education: list[str] | None=[]
    skills: list[str] | None=[]
    experiences: list[Experience]  | None = []
    projects: list[str] | None = []
    certifications: list[str] | None = []
    achievements: list[str] | None = []   

class ChatRequest(BaseModel):
    question: str

class JDRequest(BaseModel):
    job_description: str

resume_schema = Resume.model_json_schema()

# ==========================================
# 2. HELPER FUNCTIONS 
# ==========================================
def read_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text 

def resume_parser(resume_text):
    system_prompt = f"""
    You are an expert resume parser.
    Extract correct information from the resume based on actual meaning, not just exact section headings.
    Return only valid JSON matching schema from the resume:{resume_schema}

    IMPORTANT RULES:
    - Do not invent information.
    - If the value is not available return null, do not hallucinate.
    - Include internships inside experiences.
    - Extract skills, achievements (like hackathons/leetcode), and certifications correctly.
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Parse the following resume:\n{resume_text}"}
    ]
    
    response = client.chat.completions.create(
        model=model, 
        messages=messages, 
        response_format={"type": "json_object"}
    )
    
    data = json.loads(response.choices[0].message.content)
    return Resume(**data)

# ==========================================
# 3. LIFESPAN
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global resume_data
    print("🚀 Server starting... Checking parsed resume data.")
    
    if not JSON_SAVE_PATH.exists():
        print("⚠️ No JSON found. Parsing PDF now...")
        text = read_pdf(PDF_PATH)
        parsed_resume = resume_parser(text)
        
        with open(JSON_SAVE_PATH, "w", encoding="utf-8") as f:
            f.write(parsed_resume.model_dump_json(indent=4))
        print("✅ Resume parsed and saved!")
    
    with open(JSON_SAVE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        resume_data = Resume(**data)
        
    print("✅ Resume loaded into memory successfully!")
    yield
    print("🛑 Server shutting down.")

app = FastAPI(lifespan=lifespan)

# CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 4. API ROUTES 
# ==========================================
@app.get("/")
def home():
    return {"message": "Welcome to the HireMeAI backend!", "candidate": resume_data.name}

# 🔥 STREAMING CHAT ROUTE
@app.post("/chat")
def chat_bot(request: ChatRequest):
    system_prompt = f"""
    You are an AI assistant representing the job candidate.
    Below is everything you know about the candidate.

    {resume_data.model_dump_json(indent=2)}

    RULES:
    1. Answer question from this information.
    2. Do not hallucinate.
    3. If info is unavailable say "I do not have enough information".
    4. Be professional.
    5. Answer as if HR is interviewing this candidate.
    """
    
    # Generator function for streaming chunks
    def generate_response():
        stream = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question}
            ],
            stream=True # 🔥 Ye property streaming on karti hai
        )
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content

    # StreamingResponse frontend ko real-time data bhejta hai
    return StreamingResponse(generate_response(), media_type="text/event-stream")

@app.post("/evaluate-jd")
def evaluate_jd(request: JDRequest):
    system_prompt = f"""
    You are an expert AI recruiter system. 
    Compare the following Job Description (JD) with the Candidate Data.
    
    CANDIDATE DATA:
    {resume_data.model_dump_json(indent=2)}
    
    JOB DESCRIPTION:
    {request.job_description}
    
    Return the evaluation STRICTLY as a JSON object with these keys:
    - "match_percentage": (integer 0-100)
    - "matching_skills": (list of strings)
    - "missing_skills": (list of strings)
    - "evaluation_summary": (short professional paragraph)
    """
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system_prompt}],
        response_format={"type": "json_object"}
    )
    result = json.loads(response.choices[0].message.content)
    return result