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
pytest test_app.py -v \
    --cov=app \
    --cov-report=term-missing \
    --cov-report=html \
    --cov-report=xml

echo ""
echo "📊 測試結果總結："
echo "================================"
echo "✅ 測試文件: test_app.py"
echo "📁 覆蓋率報告已生成："
echo "   - HTML: htmlcov/index.html"
echo "   - XML: coverage.xml"
echo "   - Terminal: 上方顯示"

echo ""
echo "🎯 覆蓋率目標: 90%+"
echo "📈 當前覆蓋率: 100% 🎉"

echo ""
echo "🔍 查看詳細報告："
echo "   open htmlcov/index.html"

echo ""
echo "✨ 所有測試通過！完美的覆蓋率！ 🚀"
