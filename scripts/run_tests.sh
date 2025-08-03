#!/bin/bash

# TTS API 測試運行腳本

echo "🧪 Running TTS API Tests..."
echo "================================"

# 激活虛擬環境
source .venv/bin/activate

echo "📋 Python 版本："
python --version

echo "📋 已安裝的關鍵套件："
pip list | grep -E "(fastapi|pytest|httpx|coverage)"

echo ""
echo "🚀 運行測試..."
echo "================================"

# 運行測試並生成覆蓋率報告
pytest test/ -v \
    --cov=app \
    --cov=tts \
    --cov-report=term-missing \
    --cov-report=html \
    --cov-report=xml

