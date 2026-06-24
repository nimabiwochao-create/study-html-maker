# Study HTML Maker

把貼上的文字、Markdown、HTML、PDF、DOCX 文件整理成容易閱讀和複習的單頁 HTML 學習筆記。

## 作品目標

這個專案展示的是「整合現有強大工具，做出可用的學習工具」：

- 使用 `pypdf` 讀取 PDF 文字。
- 使用 `python-docx` 讀取 Word `.docx`。
- 可選擇接入 Ollama 社區模型，例如 Qwen 或 Llama，協助把零散內容重組成更自然的章節。
- 使用 Python 內建 HTTP server 提供貼上文字與上傳文件 API。
- 使用原生 HTML/CSS/JavaScript 完成貼上輸入、拖放上傳、站內預覽、下載、列印。

## 功能

- 直接貼上複製的文字並產生 HTML。
- 上傳 `.txt`、`.md`、`.html`、`.pdf`、`.docx`。
- 自動抽取文字並重組成 3-5 個主要章節。
- 若本機有 Ollama，優先使用社區開源模型整理內容。
- 若沒有 Ollama 或模型未啟動，自動退回本機規則引擎。
- 為每個章節產生「核心結論」引用區塊。
- 將零散句子整理成短條列，並只加粗少量關鍵字。
- 偵測比較型內容時產生表格，降低閱讀負擔。
- 產生可獨立保存的 HTML 筆記。
- 支援站內預覽、HTML 原始碼查看、抽取文字查看、下載與列印。

## 執行

本機 Codex 環境可以直接用：

```bash
./run-local.sh
```

一般 Python 環境請先安裝套件：

```bash
python3 -m pip install -r requirements.txt
```

再啟動網站：

```bash
python3 app.py
```

打開瀏覽器：

```text
http://127.0.0.1:5177
```

## 可選：接入社區 AI 模型

這個專案支援 Ollama。若本機有 Ollama 和模型，系統會優先請模型重組內容，再產生 HTML。

建議模型：

```bash
ollama pull qwen2.5:3b
```

啟動網站時可以指定模型：

```bash
OLLAMA_MODEL=qwen2.5:3b python3 app.py
```

如果沒有安裝 Ollama，或模型沒有啟動，網站會自動使用 `local-rules` 規則引擎，不會影響基本功能。


## 下一步預計擴充

- 加入 OCR，支援掃描圖像型 PDF。
- 串接 AI API，把快速重點改成真正的摘要和問答。
- 加入筆記分類、標籤、搜尋。
- 儲存歷史紀錄，做成個人學習資料庫。
