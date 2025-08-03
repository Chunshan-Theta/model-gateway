.PHONY: test test-cov test-html clean install dev lint format

# 安裝依賴
install:
	pip install -r requirements.txt

# 開發模式安裝
dev:
	pip install -r requirements.txt
	pip install -e .

# 運行測試
test:
	pytest

# 運行測試並生成覆蓋率報告
test-cov:
	pytest --cov=app --cov-report=term-missing

# 運行測試並生成 HTML 覆蓋率報告
test-html:
	pytest --cov=app --cov-report=html --cov-report=term-missing
	@echo "Coverage report generated in htmlcov/index.html"

# 運行特定測試文件
test-file:
	pytest test_app.py -v

# 運行測試並顯示詳細輸出
test-verbose:
	pytest -v -s

# 清理生成的文件
clean:
	rm -rf htmlcov/
	rm -rf .pytest_cache/
	rm -rf __pycache__/
	rm -f .coverage
	rm -f coverage.xml
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

# 代碼格式化
format:
	black app.py test_app.py

# 代碼檢查
lint:
	flake8 app.py test_app.py

# 啟動開發服務器
serve:
	uvicorn app:app --reload --host 0.0.0.0 --port 8000

# 運行所有檢查
check: test-cov lint
