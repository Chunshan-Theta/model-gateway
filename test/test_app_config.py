import pytest
from app import app
from tts.fishaudio.v1.endpoint import FISH_API_KEY, TTS_MODEL


class TestAppConfiguration:
    """測試應用配置"""
    
    def test_app_instance(self):
        """測試 FastAPI 應用實例"""
        assert app is not None
        assert hasattr(app, 'post')
    
    def test_environment_variables(self):
        """測試環境變數"""
        assert FISH_API_KEY is not None
        assert TTS_MODEL is not None
