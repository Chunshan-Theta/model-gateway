from fastapi import APIRouter, HTTPException
import httpx
import ormsgpack
from fastapi.responses import StreamingResponse
from io import BytesIO
import os
from dotenv import load_dotenv
from tts.models import TTSRequestV2

# 載入環境變量
load_dotenv()

router = APIRouter()

FISH_API_KEY = os.getenv("FISH_API_KEY","your_default_fish_api_key")
TTS_MODEL = "speech-s1"

@router.post("/tts/fishaudio/v2/")
async def tts_endpoint(req: TTSRequestV2):
    fish_payload = {
        "text": req.input,
        "chunk_length": 200,
        "format": req.response_format,
        "mp3_bitrate": 64 if req.response_format == "mp3" else None,
        "references": [],
        "reference_id": req.model,
        "normalize": True,
        "latency": "balanced",
        "temperature": req.temperature or 0.7,
        "top_p": req.top_p or 0.7,
        "prosody":{
            "speed": req.speed or 1.0,
            "volume": req.volume or 0.0,
        }
        
    }

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                "https://api.fish.audio/v1/tts",
                content=ormsgpack.packb(fish_payload),
                headers={
                    "authorization": f"Bearer {FISH_API_KEY}",
                    "content-type": "application/msgpack",
                    "model": req.base_model or TTS_MODEL,
                },
            ) as resp:

                if resp.status_code != 200:
                    raise HTTPException(status_code=resp.status_code, detail=await resp.aread())

                buffer = BytesIO()
                async for chunk in resp.aiter_bytes():
                    buffer.write(chunk)
                buffer.seek(0)

                return StreamingResponse(
                    buffer,
                    media_type=f"audio/{req.response_format}",
                    headers={"Content-Disposition": f"attachment; filename=output.{req.response_format}"}
                )
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
