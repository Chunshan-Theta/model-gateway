from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Literal
import httpx
import ormsgpack
from fastapi.responses import StreamingResponse
from io import BytesIO
import os

# 環境變數或硬編碼都可以
FISH_API_KEY = "YOUR_API_KEY"
TTS_MODEL = "speech-1.6"

app = FastAPI()


class TTSRequest(BaseModel):
    text: str
    reference_id: str
    format: Literal["mp3", "wav", "pcm"] = "mp3"
    mp3_bitrate: Literal[64, 128, 192] = 128


@app.post("/tts")
async def tts_endpoint(req: TTSRequest):
    fish_payload = {
        "text": req.text,
        "chunk_length": 200,
        "format": req.format,
        "mp3_bitrate": req.mp3_bitrate,
        "references": [],  # 簡化為只使用 reference_id
        "reference_id": req.reference_id,
        "normalize": True,
        "latency": "normal",
    }

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            resp = await client.stream(
                "POST",
                "https://api.fish.audio/v1/tts",
                content=ormsgpack.packb(fish_payload),
                headers={
                    "authorization": f"Bearer {FISH_API_KEY}",
                    "content-type": "application/msgpack",
                    "model": TTS_MODEL,
                },
            )

            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail=await resp.aread())

            buffer = BytesIO()
            async for chunk in resp.aiter_bytes():
                buffer.write(chunk)
            buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type=f"audio/{req.format}",
            headers={"Content-Disposition": f"attachment; filename=output.{req.format}"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
