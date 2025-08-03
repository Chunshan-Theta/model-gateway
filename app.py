from fastapi import FastAPI
from tts.fishaudio.v1.endpoint import router as tts_router

app = FastAPI()
app.include_router(tts_router)
