from pydantic import BaseModel
from typing import Literal

class TTSRequest(BaseModel):
    """Text-to-Speech request model following OpenAI's API format.
    
    Attributes:
        input: The text to be converted to speech.
        model: The model identifier to be used for speech generation.
        response_format: The format of the audio response. Default is "mp3".
    """
    input: str
    model: str
    response_format: Literal["mp3", "wav", "pcm"] = "mp3"
