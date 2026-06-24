const fileInput = document.querySelector("#fileInput");
const chooseButton = document.querySelector("#chooseButton");
const uploadForm = document.querySelector("#uploadForm");
const statusBox = document.querySelector("#status");
const titleInput = document.querySelector("#titleInput");
const pasteInput = document.querySelector("#pasteInput");
const pasteButton = document.querySelector("#pasteButton");
const sampleButton = document.querySelector("#sampleButton");
const rerenderButton = document.querySelector("#rerenderButton");
const downloadButton = document.querySelector("#downloadButton");
const printButton = document.querySelector("#printButton");
const previewSurface = document.querySelector("#previewSurface");
const emptyState = document.querySelector("#emptyState");
const sourceOutput = document.querySelector("#sourceOutput");
const textOutput = document.querySelector("#textOutput");
const sectionCount = document.querySelector("#sectionCount");
const readingTime = document.querySelector("#readingTime");
const charCount = document.querySelector("#charCount");
const organizerName = document.querySelector("#organizerName");

let currentResult = null;
let currentPreviewUrl = null;

const sampleText = `1. 為什麼需要整理學習資料

很多課堂 PDF、網頁文章和臨時筆記雖然內容很多，但排版不一定適合複習。把內容轉成清楚的 HTML 學習頁，可以讓章節、重點和閱讀順序更明確。

2. 這個作品的技術方法

後端負責接收貼上的文字或上傳檔案，抽取內容後切成章節，再產生一份完整 HTML。前端負責輸入、預覽、下載和列印，讓使用者可以在同一個網站完成整個流程。

3. 可以展示的能力

這個專案展示了文件處理、API 設計、前端互動、HTML 生成和作品包裝。引用開源工具處理 PDF 和 Word，自己負責把工具整合成可用的學習網站。`;

chooseButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) convertFile(file);
});

pasteButton.addEventListener("click", () => convertPastedText());
sampleButton.addEventListener("click", () => {
  titleInput.value = "Study HTML Maker 作品說明";
  pasteInput.value = sampleText;
  convertPastedText();
});

rerenderButton.addEventListener("click", () => {
  if (!currentResult) return;
  convertPastedText(currentResult.plainText);
});

pasteInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    convertPastedText();
  }
});

uploadForm.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadForm.classList.add("dragging");
});

uploadForm.addEventListener("dragleave", () => {
  uploadForm.classList.remove("dragging");
});

uploadForm.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadForm.classList.remove("dragging");
  const file = event.dataTransfer.files?.[0];
  if (file) convertFile(file);
});

downloadButton.addEventListener("click", () => {
  if (!currentResult) return;
  const blob = new Blob([currentResult.html], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(currentResult.title)}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
});

printButton.addEventListener("click", () => {
  if (!currentResult) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    setStatus("瀏覽器阻擋了列印視窗，請允許彈出視窗後再試一次。", "error");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(currentResult.html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".viewer").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}Viewer`).classList.add("active");
  });
});

async function convertPastedText(overrideText) {
  const text = overrideText ?? pasteInput.value;
  if (!text.trim()) {
    setStatus("請先貼上一段文字。", "error");
    pasteInput.focus();
    return;
  }

  setStatus("正在把貼上的文字整理成 HTML...", "working");
  try {
    const response = await fetch("/api/paste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleInput.value,
        text,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "轉換失敗。");
    currentResult = result;
    titleInput.value = result.title;
    paintResult(result);
    setStatus("完成：已產生可檢閱的 HTML。", "ready");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function convertFile(file) {
  setStatus(`正在整理 ${file.name}...`, "working");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/convert", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "轉換失敗。");
    currentResult = result;
    titleInput.value = result.title;
    pasteInput.value = result.plainText;
    paintResult(result);
    setStatus(`完成：${result.filename}`, "ready");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function paintResult(result) {
  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl);
  }
  currentPreviewUrl = URL.createObjectURL(new Blob([result.html], { type: "text/html;charset=utf-8" }));
  renderPreview(result.html);
  sourceOutput.value = result.html;
  textOutput.value = result.plainText;
  sectionCount.textContent = result.stats.sections;
  readingTime.textContent = `${result.stats.readingMinutes} 分`;
  charCount.textContent = result.stats.characters.toLocaleString();
  organizerName.textContent = result.organizer || "local-rules";
  emptyState.hidden = true;
  rerenderButton.disabled = false;
  downloadButton.disabled = false;
  printButton.disabled = false;
}

function renderPreview(documentHtml) {
  const parsed = new DOMParser().parseFromString(documentHtml, "text/html");
  const bodyHtml = parsed.body?.innerHTML || "";
  previewSurface.innerHTML = bodyHtml;
}

function setStatus(message, state = "") {
  statusBox.textContent = message;
  statusBox.dataset.state = state;
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "study-notes";
}
