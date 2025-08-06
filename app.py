from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tts.fishaudio.v1.endpoint import router as tts_router_v1
from tts.fishaudio.v2.endpoint import router as tts_router_v2

app = FastAPI()

# 添加 CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有來源，生產環境建議指定具體域名
    allow_credentials=True,
    allow_methods=["*"],  # 允許所有 HTTP 方法
    allow_headers=["*"],  # 允許所有標頭
)

app.include_router(tts_router_v1)
app.include_router(tts_router_v2)

