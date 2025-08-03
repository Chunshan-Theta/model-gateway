# TTS API Gateway

這是一個 FastAPI 應用程序，提供 Text-to-Speech (TTS) 服務，作為 Fish Audio API 的代理。

## 功能特性

- 文本轉語音 API 端點
- 支持多種音頻格式 (mp3, wav, pcm)
- 可配置的音頻比特率
- 流式響應處理
- 完整的錯誤處理

## 安裝和設置

### 1. 創建虛擬環境
```bash
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# 或
.venv\Scripts\activate     # Windows
```

### 2. 安裝依賴
```bash
pip install -r requirements.txt
```

### 3. 配置環境變數
在 `app.py` 中設置你的 Fish API 密鑰：
```python
FISH_API_KEY = "YOUR_ACTUAL_API_KEY"
```

## 運行應用

### 開發模式
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 使用 Makefile
```bash
make serve
```

## API 使用

### TTS 端點
```
POST /tts
```

#### 請求體
```json
{
    "text": "Hello world",
    "reference_id": "your_reference_id",
    "format": "mp3",        // 可選：mp3, wav, pcm
    "mp3_bitrate": 128      // 可選：64, 128, 192
}
```

#### 響應
返回音頻文件流

## 測試

本項目包含完整的單元測試，覆蓋率達到 **100%**！

### 運行測試
```bash
# 基本測試
pytest

# 帶覆蓋率報告
pytest --cov=app --cov-report=term-missing

# 生成 HTML 覆蓋率報告
pytest --cov=app --cov-report=html

# 使用 Makefile
make test-html
```

### 測試覆蓋

測試包括以下方面：

#### 1. TTSRequest 模型測試
- ✅ 有效數據驗證
- ✅ 自定義格式和比特率
- ✅ 無效格式檢測
- ✅ 無效比特率檢測

#### 2. TTS 端點測試
- ✅ 成功的 TTS 請求
- ✅ WAV 格式請求
- ✅ API 錯誤響應處理
- ✅ 網絡錯誤處理
- ✅ 缺少參數驗證
- ✅ 空文本處理
- ✅ Payload 結構驗證

#### 3. 應用配置測試
- ✅ FastAPI 實例測試
- ✅ 環境變數測試

### 覆蓋率報告

當前覆蓋率：**100%** (31 行全部覆蓋)

所有代碼路徑都已經過測試！

### 查看詳細覆蓋率報告

運行測試後，打開 `htmlcov/index.html` 查看詳細的 HTML 覆蓋率報告。

## 可用的 Make 命令

```bash
make install     # 安裝依賴
make test        # 運行測試
make test-cov    # 運行測試並顯示覆蓋率
make test-html   # 生成 HTML 覆蓋率報告
make clean       # 清理生成的文件
make serve       # 啟動開發服務器
make check       # 運行所有檢查（測試+覆蓋率）
```

## 項目結構

```
model-gateway/
├── app.py              # 主應用文件
├── test_app.py         # 測試文件
├── requirements.txt    # 依賴列表
├── pytest.ini         # pytest 配置
├── .coveragerc         # 覆蓋率配置
├── Makefile           # 常用命令
├── README.md          # 項目文檔
├── .github/           # GitHub Actions 工作流
│   └── workflows/
│       └── test.yml
├── htmlcov/           # HTML 覆蓋率報告（生成）
└── .venv/             # 虛擬環境（本地）
```

## CI/CD

項目包含 GitHub Actions 工作流，會在推送代碼時自動運行測試並檢查覆蓋率。

## 技術棧

- **FastAPI**: Web 框架
- **httpx**: 異步 HTTP 客戶端
- **ormsgpack**: MessagePack 序列化
- **pytest**: 測試框架
- **pytest-cov**: 覆蓋率測試
- **pytest-asyncio**: 異步測試支持
- **Pydantic**: 數據驗證

## 注意事項

1. 確保設置了正確的 Fish API 密鑰
2. 測試使用了 mock，不會實際調用外部 API
3. 生產環境部署前，建議設置環境變數管理 API 密鑰
4. 某些邊緣情況的測試（如特定的異步上下文錯誤）可能需要進一步調整
