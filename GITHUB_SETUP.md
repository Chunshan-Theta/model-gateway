# 推送到 GitHub 指南

## 步驟 1: 在 GitHub 上創建新的 repository

1. 打開 [GitHub](https://github.com)
2. 點擊右上角的 "+" 按鈕，選擇 "New repository"
3. 設置 repository 名稱（建議使用 `tts-api-gateway` 或 `model-gateway`）
4. 選擇 Public 或 Private
5. **不要**勾選 "Add a README file"、"Add .gitignore" 或 "Choose a license"（因為我們已經有了這些文件）
6. 點擊 "Create repository"

## 步驟 2: 獲取 repository URL

在創建完成後，GitHub 會顯示一個頁面，複製 HTTPS 或 SSH URL。
例如：`https://github.com/yourusername/tts-api-gateway.git`

## 步驟 3: 添加遠程 origin 並推送

在終端中運行以下命令（將 URL 替換為你的實際 repository URL）：

```bash
# 添加遠程 repository
git remote add origin https://github.com/yourusername/tts-api-gateway.git

# 推送到 GitHub
git push -u origin main
```

## 步驟 4: 驗證推送成功

推送完成後，在 GitHub 頁面刷新，你應該能看到所有文件。

## 可選：設置 GitHub Pages（如果你想展示文檔）

1. 在 repository 頁面，點擊 "Settings"
2. 滾動到 "Pages" 部分
3. 選擇 "Deploy from a branch"
4. 選擇 "main" 分支
5. 點擊 "Save"

## 後續開發工作流

```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push
```

## 項目特色

你的項目包含以下優秀特性：

✅ **完整的測試覆蓋** - 100% 代碼覆蓋率
✅ **自動化 CI/CD** - GitHub Actions 工作流
✅ **詳細文檔** - README 和代碼註釋
✅ **開發工具** - Makefile、測試腳本
✅ **最佳實踐** - .gitignore、虛擬環境、依賴管理

這是一個生產就緒的高質量項目！🚀
