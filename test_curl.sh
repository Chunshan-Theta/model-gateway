#!/bin/bash

# TTS API curl 測試腳本
# 測試輸入文字，輸出音頻文件

echo "開始測試 TTS API..."

# 設定測試參數
API_URL="http://localhost:8000/tts/fishaudio/v1/"
OUTPUT_FILE="test_output.mp3"
TEST_TEXT="您好，這是一條文字轉語音的測試訊息。"
REFERENCE_ID="b78b2eb444274e319bd4aeb5b7d119ac"

# 發送 POST 請求並保存音頻文件
echo "發送請求到: $API_URL"
echo "測試文字: $TEST_TEXT"
echo "輸出文件: $OUTPUT_FILE"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "'"$TEST_TEXT"'",
    "reference_id": "'"$REFERENCE_ID"'",
    "format": "mp3",
    "mp3_bitrate": 128
  }' \
  --output "$OUTPUT_FILE" \
  --write-out "HTTP Status: %{http_code}\nTotal time: %{time_total}s\nDownload size: %{size_download} bytes\n"

# 檢查結果
if [ -f "$OUTPUT_FILE" ]; then
    file_size=$(wc -c < "$OUTPUT_FILE")
    echo "✅ 測試成功！"
    echo "📁 輸出文件: $OUTPUT_FILE"
    echo "📏 文件大小: $file_size bytes"
    
    # 檢查文件是否為有效的音頻文件
    if [ "$file_size" -gt 0 ]; then
        echo "🎵 音頻文件已生成"
        # 如果系統有 file 命令，顯示文件類型
        if command -v file &> /dev/null; then
            echo "📋 文件類型: $(file "$OUTPUT_FILE")"
        fi
    else
        echo "❌ 警告: 輸出文件為空"
    fi
else
    echo "❌ 測試失敗：未找到輸出文件"
fi

echo "測試完成。"
