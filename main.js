<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VocaForge - English Practice Tool</title>
  <style>
    body {
      font-family: "Segoe UI", sans-serif;
      background-color: #f0f0f0;
      margin: 0;
      padding: 0;
    }
    .navbar {
      background-color: #c5322c;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .navbar button {
      background: white;
      color: #c5322c;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      margin-left: 1rem;
    }
    .container {
      max-width: 960px;
      margin: 2rem auto;
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .section { display: none; }
    .section.active { display: block; }
    textarea, input[type='text'] {
      width: 100%;
      padding: 0.75rem;
      margin: 0.5rem 0 1rem;
      font-size: 1rem;
      border: 2px solid #ffa726;
      background-color: #e3f2fd;
      border-radius: 8px;
      color: #333;
    }
    .card {
      background: #fff;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      margin-top: 1rem;
    }
    input.wrong {
      border-color: red !important;
      background-color: #ffe5e5 !important;
    }
  </style>
</head>
<body>
  <div class="navbar">
    <strong>🔨 VocaForge</strong>
    <div>
      <button onclick="switchTab('cloze')">📝 Article Cloze</button>
      <button onclick="switchTab('word')">📘 Word Practice</button>
    </div>
  </div>

  <div class="container">
    <h2 id="pageTitle">Welcome to VocaForge</h2>

    <div class="section active" id="clozeSection">
      <textarea id="articleInput" rows="10" placeholder="Paste your article here..."></textarea>
      <button onclick="generateCloze()">🔍 Generate Cloze</button>
      <div id="clozeArea"></div>
      <button onclick="submitCloze()">✅ Submit Answers</button>
    </div>

    <div class="section" id="wordSection">
      <textarea id="wordList" rows="8" placeholder="Paste word list here (e.g., word[TAB]meaning)..."></textarea>
      <button onclick="loadWordList()">📥 Load Words</button>
      <div class="card" id="wordPracticeArea" style="display:none">
        <p id="wordPrompt"></p>
        <input type="text" id="wordAnswer" />
        <button onclick="submitWordAnswer()">Submit</button>
      </div>
      <button onclick="startMistakeReview()">🔁 Review Mistakes</button>
      <button onclick="exportMistakes()">💾 Export Mistakes</button>
      <input type="file" id="importFile" onchange="importMistakes(event)" />
    </div>
  </div>

  <audio id="errorSound" src="oh-oh.mp3" preload="auto"></audio>

  <script>
    let wordPairs = [], mistakes = [], isReviewing = false, reviewIndex = 0;

    function switchTab(tab) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(tab + 'Section').classList.add('active');
      document.getElementById('pageTitle').innerText = tab === 'cloze' ? 'Article Cloze' : 'Word Practice';
    }

    function generateCloze() {
      const input = document.getElementById("articleInput").value;
      const words = input.split(/\b/);
      const indices = [];
      for (let i = 0; i < words.length; i++) {
        if (/\w+/.test(words[i])) indices.push(i);
      }
      const chosen = indices.sort(() => 0.5 - Math.random()).slice(0, 5);
      const clozeArea = document.getElementById("clozeArea");
      clozeArea.innerHTML = words.map((w, i) => chosen.includes(i) ? `<input type='text' data-answer='${w}'>` : w).join('');
    }

    function submitCloze() {
      const inputs = document.querySelectorAll('#clozeArea input');
      inputs.forEach(input => {
        const correct = input.dataset.answer.trim().toLowerCase();
        const user = input.value.trim().toLowerCase();
        if (correct !== user) {
          input.classList.add("wrong");
          document.getElementById("errorSound").play();
        } else {
          input.classList.remove("wrong");
        }
      });
    }

    function loadWordList() {
      const raw = document.getElementById("wordList").value.trim();
      wordPairs = raw.split('\n').map(line => {
        const [en, cn] = line.split(/\t|\s{2,}/);
        return { en: en.trim(), cn: cn.trim() };
      });
      shuffleArray(wordPairs);
      isReviewing = false;
      mistakes = [];
      showNextWord();
    }

    function showNextWord() {
      const area = document.getElementById("wordPracticeArea");
      area.style.display = 'block';
      document.getElementById("wordAnswer").value = "";
      const current = isReviewing ? mistakes[reviewIndex] : wordPairs[0];
      if (!current) {
        alert("练习完成！");
        area.style.display = 'none';
        return;
      }
      document.getElementById("wordPrompt").innerText = current.cn;
    }

    function submitWordAnswer() {
      const input = document.getElementById("wordAnswer");
      const value = input.value.trim().toLowerCase();
      const current = isReviewing ? mistakes[reviewIndex] : wordPairs[0];
      if (value === current.en.toLowerCase()) {
        input.classList.remove("wrong");
        if (isReviewing) {
          reviewIndex++;
        } else {
          wordPairs.shift();
        }
        showNextWord();
      } else {
        input.classList.add("wrong");
        document.getElementById("errorSound").play();
        if (!isReviewing && !mistakes.find(w => w.en === current.en)) {
          mistakes.push(current);
        }
      }
    }

    function exportMistakes() {
      const blob = new Blob([JSON.stringify(mistakes)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mistakes.json";
      a.click();
      URL.revokeObjectURL(url);
    }

    function importMistakes(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          mistakes = JSON.parse(reader.result);
          alert("错词本导入成功！");
        } catch {
          alert("文件格式错误");
        }
      };
      reader.readAsText(file);
    }

    function startMistakeReview() {
      if (mistakes.length === 0) {
        alert("当前没有错词记录");
        return;
      }
      isReviewing = true;
      reviewIndex = 0;
      showNextWord();
    }

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  </script>
</body>
</html>
