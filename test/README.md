# 測試結構說明

## 測試架構

本項目採用模組化測試架構，測試結構與 API 結構保持一致：

```
test/
├── __init__.py
├── test_app_config.py          # 應用程式配置測試
├── run_tests.py                # 主測試運行腳本
└── tts/                        # TTS 相關測試
    ├── __init__.py
    └── fishaudio/              # FishAudio 提供商測試
        ├── __init__.py
        └── v1/                 # v1 API 版本測試
            ├── __init__.py
            └── test_endpoint.py    # 端點功能測試
```

## 測試內容

### test_app_config.py
- 測試 FastAPI 應用程式實例
- 測試環境變數配置

### test/tts/fishaudio/v1/test_endpoint.py
- **TestTTSEndpoint**: TTS API 端點測試
  - 成功請求測試
  - 不同音頻格式測試 (MP3, WAV, PCM)
  - API 錯誤處理測試
  - 網路錯誤處理測試
  - 參數驗證測試
  - 空文本處理測試
  - API 請求結構測試

- **TestTTSRequest**: 請求模型測試
  - 有效數據驗證
  - 自定義格式驗證

## 運行測試

### 使用 Make 命令（推薦）
```bash
make test
```

### 直接使用 pytest
```bash
pytest test/ -v --cov=app --cov=tts --cov-report=html
```

### 使用測試運行腳本
```bash
python test/run_tests.py
```

## 測試報告

測試完成後會生成以下報告：
- **Terminal**: 終端覆蓋率報告
- **HTML**: `htmlcov/index.html` - 詳細的 HTML 覆蓋率報告
- **XML**: `coverage.xml` - XML 格式覆蓋率報告

## 添加新測試

當添加新的 API 端點時，請按照相同的結構創建對應的測試文件：

1. 在 `test/` 下創建與 API 結構相同的資料夾
2. 創建對應的測試文件 `test_*.py`
3. 在測試文件中創建測試類 `Test*`
4. 實現測試方法 `test_*`

### 示例：添加新的 ASR API 測試

```
test/
└── asr/                    # 新的 ASR API 測試
    ├── __init__.py
    └── whisper/
        ├── __init__.py
        └── v1/
            ├── __init__.py
            └── test_endpoint.py
```

這樣的結構確保：
- 測試組織清晰
- 易於維護和擴展
- 與實際 API 結構保持一致
- 支持獨立測試各個模組
