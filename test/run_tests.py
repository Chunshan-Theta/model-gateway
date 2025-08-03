"""
主測試運行腳本
用於運行所有測試模組
"""
import pytest
import sys
import os

# 將項目根目錄添加到 Python 路徑
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    # 運行所有測試
    pytest.main([
        "test/",
        "-v",
        "--cov=app",
        "--cov=tts",
        "--cov-report=html",
        "--cov-report=term-missing",
        "--cov-report=xml"
    ])
