// 控制字体设置逻辑
const fontSelect = document.getElementById("fontSelect");
const fontSizeSelect = document.getElementById("fontSizeSelect");
const lineHeightSelect = document.getElementById("lineHeightSelect");

const inputText = document.getElementById("inputText");
const practiceArea = document.getElementById("practiceArea");

function applyStyles() {
  const font = fontSelect.value;
  const fontSize = fontSizeSelect.value;
  const lineHeight = lineHeightSelect.value;

  [inputText, practiceArea].forEach(el => {
    el.style.fontFamily = font;
    el.style.fontSize = fontSize;
    el.style.lineHeight = lineHeight;
  });
}

fontSelect.addEventListener("change", applyStyles);
fontSizeSelect.addEventListener("change", applyStyles);
lineHeightSelect.addEventListener("change", applyStyles);

const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
  const text = inputText.value.trim();
  practiceArea.innerHTML = "";

  if (!text) {
    alert("Please enter some text to practice.");
    return;
  }

  const font = fontSelect.value;
  const fontSize = fontSizeSelect.value;
  const lineHeight = lineHeightSelect.value;

  const sentences = text.split(/(?<=[.!?])\s+|\n+/);

  sentences.forEach(sentence => {
    if (sentence.trim() === "") return;

    const wrapper = document.createElement("div");
    wrapper.className = "sentence-block";

    const sentenceText = document.createElement("div");
    sentenceText.className = "sentence";
    sentenceText.textContent = sentence.trim();
    sentenceText.style.fontFamily = font;
    sentenceText.style.fontSize = fontSize;
    sentenceText.style.lineHeight = lineHeight;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "typing-input";
    input.placeholder = "Type here...";
    input.style.fontFamily = font;
    input.style.fontSize = fontSize;
    input.style.lineHeight = lineHeight;
    input.style.width = "100%";

    // 实时纠错逻辑
    input.addEventListener("input", () => {
      const expected = sentence.trim().toLowerCase();
      const actual = input.value.trim().toLowerCase();
      if (expected.startsWith(actual)) {
        input.classList.remove("wrong");
      } else {
        input.classList.add("wrong");
      }
    });

    wrapper.appendChild(sentenceText);
    wrapper.appendChild(input);
    practiceArea.appendChild(wrapper);
  });
});

// 初始应用
applyStyles();

