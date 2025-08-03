import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
from io import BytesIO
import httpx
from app import app
from tts.fishaudio.v1.endpoint import router, TTSRequest, FISH_API_KEY, TTS_MODEL

client = TestClient(app)

class TestTTSEndpoint:
    """測試 TTS 端點"""
    
    @patch('tts.fishaudio.v1.endpoint.httpx.AsyncClient')
    def test_tts_endpoint_success(self, mock_client):
        """測試成功的 TTS 請求"""
        # 模擬音頻數據
        mock_audio_data = b"fake_audio_data"
        
        # 創建模擬響應
        mock_response = AsyncMock()
        mock_response.status_code = 200
        
        async def mock_aiter_bytes():
            yield mock_audio_data
        
        mock_response.aiter_bytes = mock_aiter_bytes
        
        # 創建模擬客戶端
        mock_client_instance = AsyncMock()
        mock_client_instance.stream = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # 發送請求
        response = client.post("/tts/fishaudio/v1/", json={
            "text": "Hello world",
            "reference_id": "test_ref_123"
        })
        
        # 驗證響應
        assert response.status_code == 200
        assert response.headers["content-type"] == "audio/mp3"
        assert "attachment; filename=output.mp3" in response.headers["content-disposition"]
        assert response.content == mock_audio_data
    
    @patch('tts.fishaudio.v1.endpoint.httpx.AsyncClient')
    def test_tts_endpoint_with_wav_format(self, mock_client):
        """測試 WAV 格式的 TTS 請求"""
        mock_audio_data = b"fake_wav_audio_data"
        
        mock_response = AsyncMock()
        mock_response.status_code = 200
        
        async def mock_aiter_bytes():
            yield mock_audio_data
        
        mock_response.aiter_bytes = mock_aiter_bytes
        
        mock_client_instance = AsyncMock()
        mock_client_instance.stream = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        response = client.post("/tts/fishaudio/v1/", json={
            "text": "Hello world",
            "reference_id": "test_ref_123",
            "format": "wav",
            "mp3_bitrate": 192
        })
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "audio/wav"
        assert "attachment; filename=output.wav" in response.headers["content-disposition"]
    
    @patch('tts.fishaudio.v1.endpoint.httpx.AsyncClient')
    def test_tts_endpoint_api_error(self, mock_client):
        """測試 API 錯誤響應"""
        mock_response = AsyncMock()
        mock_response.status_code = 400
        mock_response.aread = AsyncMock(return_value=b"Bad Request")
        
        mock_client_instance = AsyncMock()
        mock_client_instance.stream = AsyncMock(return_value=mock_response)
        
        mock_client.return_value = AsyncMock()
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        response = client.post("/tts/fishaudio/v1/", json={
            "text": "Hello world",
            "reference_id": "test_ref_123"
        })
        
        # 在這種情況下，我們期望 HTTPException 會被捕獲並轉換為 500 錯誤
        assert response.status_code == 500
        # 檢查響應中包含相關的錯誤信息
        detail = response.json()["detail"]
        assert detail is not None  # 確保有錯誤詳情
    
    @patch('tts.fishaudio.v1.endpoint.httpx.AsyncClient')
    def test_tts_endpoint_network_error(self, mock_client):
        """測試網絡錯誤"""
        mock_client_instance = AsyncMock()
        mock_client_instance.stream = AsyncMock(side_effect=httpx.RequestError("Network error"))
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        response = client.post("/tts/fishaudio/v1/", json={
            "text": "Hello world",
            "reference_id": "test_ref_123"
        })
        
        assert response.status_code == 500
        assert "Network error" in response.json()["detail"]
    
    def test_tts_endpoint_missing_text(self):
        """測試缺少文本參數"""
        response = client.post("/tts/fishaudio/v1/", json={
            "reference_id": "test_ref_123"
        })
        
        assert response.status_code == 422  # Validation error
        assert "text" in response.json()["detail"][0]["loc"]
    
    def test_tts_endpoint_missing_reference_id(self):
        """測試缺少 reference_id 參數"""
        response = client.post("/tts/fishaudio/v1/", json={
            "text": "Hello world"
        })
        
        assert response.status_code == 422  # Validation error
        assert "reference_id" in response.json()["detail"][0]["loc"]
    
    def test_tts_endpoint_empty_text(self):
        """測試空文本"""
        # 我們需要設置 mock 來處理空文本的情況
        with patch('tts.fishaudio.v1.endpoint.httpx.AsyncClient') as mock_client:
            mock_response = AsyncMock()
            mock_response.status_code = 200
            
            async def mock_aiter_bytes():
                yield b"empty_audio"
            
            mock_response.aiter_bytes = mock_aiter_bytes
            
            mock_client_instance = AsyncMock()
            mock_client_instance.stream = AsyncMock(return_value=mock_response)
            mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client_instance)
            mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
            
            response = client.post("/tts/fishaudio/v1/", json={
                "text": "",
                "reference_id": "test_ref_123"
            })
            
            # 應該成功處理空文本
            assert response.status_code == 200
    
    @patch('tts.fishaudio.v1.endpoint.httpx.AsyncClient')
    def test_tts_endpoint_payload_structure(self, mock_client):
        """測試發送到 Fish API 的 payload 結構"""
        mock_response = AsyncMock()
        mock_response.status_code = 200
        
        async def mock_aiter_bytes():
            yield b"audio"
        
        mock_response.aiter_bytes = mock_aiter_bytes
        
        mock_client_instance = AsyncMock()
        mock_client_instance.stream = AsyncMock(return_value=mock_response)
        mock_client.return_value.__aenter__ = AsyncMock(return_value=mock_client_instance)
        mock_client.return_value.__aexit__ = AsyncMock(return_value=None)
        
        response = client.post("/tts/fishaudio/v1/", json={
            "text": "Test text",
            "reference_id": "ref_123",
            "format": "pcm",
            "mp3_bitrate": 64
        })
        
        # 驗證調用參數
        mock_client_instance.stream.assert_called_once()
        call_args = mock_client_instance.stream.call_args
        
        # 檢查 URL - 使用位置參數而不是關鍵字參數
        assert call_args[0][1] == "https://api.fish.audio/v1/tts"
        
        # 檢查 headers
        headers = call_args[1]["headers"]
        assert headers["content-type"] == "application/msgpack"
        assert headers["model"] == "speech-1.6"
        assert "Bearer" in headers["authorization"]


class TestTTSRequest:
    """測試 TTSRequest 模型"""
    
    def test_tts_request_valid_data(self):
        """測試有效的 TTS 請求數據"""
        data = {
            "text": "Hello world",
            "reference_id": "test_ref_123"
        }
        request = TTSRequest(**data)
        assert request.text == "Hello world"
        assert request.reference_id == "test_ref_123"
        assert request.format == "mp3"  # 默認值
        assert request.mp3_bitrate == 128  # 默認值
    
    def test_tts_request_custom_format(self):
        """測試自定義格式"""
        data = {
            "text": "Hello world",
            "reference_id": "test_ref_123",
            "format": "wav",
            "mp3_bitrate": 192
        }
        request = TTSRequest(**data)
        assert request.format == "wav"
        assert request.mp3_bitrate == 192
