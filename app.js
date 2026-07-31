/* ==========================================================
   STUDIORA — app.js
   Connects the existing HTML/CSS UI to the real FastAPI backend.
   Uses a silent demo-user auto-login so no login screen is needed
   for the hackathon demo (swap for a real login form later if needed).
   ========================================================== */

// API_BASE resolution, in priority order:
//  1. window.STUDIORA_API_BASE, if the deployed page sets it (e.g. an inline
//     <script>window.STUDIORA_API_BASE = "https://api.example.com";</script>
//     before this file loads).
//  2. http://localhost:8000, for local development.
//  3. Otherwise, assume the FastAPI backend is deployed at the same host on
//     port 8000 (adjust here if it's deployed behind a path/subdomain instead).
const API_BASE =
  window.STUDIORA_API_BASE ||
  (location.protocol === "file:" || ["localhost", "127.0.0.1", ""].includes(location.hostname)
    ? "http://localhost:8000"
    : `${location.protocol}//${location.hostname}:8000`);

const CONFIG = {
  API_BASE,
  DEMO_EMAIL: "demo@studiora.com",
  DEMO_PASSWORD: "studiora-demo-2026",
  DEMO_NAME: "Demo Student",
};

let TOKEN = null;

// ---------------------------------------------------------
// 0. LOW-LEVEL API HELPER
// ---------------------------------------------------------
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
  }
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

  const res = await fetch(`${CONFIG.API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

async function apiUpload(path, file) {
  const formData = new FormData();
  formData.append("file", file);
  const headers = {};
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;
  const res = await fetch(`${CONFIG.API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload ${path} -> ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------
// 1. SILENT DEMO AUTH — register once, then just log in
// ---------------------------------------------------------
async function ensureAuth() {
  try {
    const login = await api("/auth/login", {
      method: "POST",
      body: new URLSearchParams({
        username: CONFIG.DEMO_EMAIL,
        password: CONFIG.DEMO_PASSWORD,
      }),
    });
    TOKEN = login.access_token;
  } catch {
    // not registered yet -> register then log in
    await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: CONFIG.DEMO_EMAIL,
        name: CONFIG.DEMO_NAME,
        password: CONFIG.DEMO_PASSWORD,
      }),
    });
    const login = await api("/auth/login", {
      method: "POST",
      body: new URLSearchParams({
        username: CONFIG.DEMO_EMAIL,
        password: CONFIG.DEMO_PASSWORD,
      }),
    });
    TOKEN = login.access_token;
  }
  localStorage.setItem("studiora_token", TOKEN);
}

// ---------------------------------------------------------
// 2. TOAST + VIEW SWITCHING (uses existing HTML structure)
// ---------------------------------------------------------
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(`view-${name}`)?.classList.add("active");
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  document.querySelector(`.nav-item[data-view="${name}"]`)?.classList.add("active");

  const titles = {
    dashboard: ["Dashboard", "Your adaptive study cockpit."],
    checkin: ["Daily Check-in", "Tell Studiora how you're feeling today."],
    planner: ["Syllabus Planner", "Turn your syllabus into a schedule."],
    weak: ["Weak Zone Radar", "Where your accuracy needs work."],
    retention: ["Forgetting Curve", "What you're about to forget."],
    triage: ["Exam Triage", "What matters most, right now."],
    mock: ["Mock Tests", "Practice pulled from your own topics."],
    flora: ["Flora AI", "Your always-on study coach."],
    peers: ["Peer Benchmark", "Anonymous comparison, for motivation."],
  };
  const [title, sub] = titles[name] || ["Studiora", ""];
  document.getElementById("viewTitle").textContent = title;
  document.getElementById("viewSub").textContent = sub;

  // lazy-load data only when a tab is opened
  const loaders = {
    dashboard: loadDashboard,
    weak: loadWeakZones,
    retention: loadRetention,
    triage: loadTriage,
    mock: loadMockSetup,
    flora: loadChatHistory,
    planner: loadPlannerTopics,
  };
  loaders[name]?.();
}

document.getElementById("nav").addEventListener("click", (e) => {
  const btn = e.target.closest(".nav-item");
  if (btn) showView(btn.dataset.view);
});
document.getElementById("quickCheckin").addEventListener("click", () => showView("checkin"));

// ---------------------------------------------------------
// 3. DAILY CHECK-IN  (energy/focus/hours/mood -> POST /checkin, then /planner/generate)
// ---------------------------------------------------------
const energyEl = document.getElementById("energy");
const focusEl = document.getElementById("focus");
const hoursEl = document.getElementById("hours");
let selectedMood = "calm";

energyEl.addEventListener("input", () => (document.getElementById("lblEnergy").textContent = energyEl.value));
focusEl.addEventListener("input", () => (document.getElementById("lblFocus").textContent = focusEl.value));
hoursEl.addEventListener("input", () => (document.getElementById("lblHours").textContent = hoursEl.value));

document.getElementById("moodChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll("#moodChips .chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  selectedMood = chip.dataset.mood;
});

// UI uses 1-10 sliders; backend schema expects mood 1-5 and energy 1-5.
// Map mood word -> 1-5 score, and scale the 1-10 energy slider down to 1-5.
const MOOD_TO_SCORE = { anxious: 1, tired: 2, calm: 4, motivated: 5 };

document.getElementById("generatePlan").addEventListener("click", async () => {
  try {
    const moodScore = MOOD_TO_SCORE[selectedMood] ?? 3;
    const energyScore = Math.max(1, Math.min(5, Math.round(Number(energyEl.value) / 2)));
    const availableMinutes = Number(hoursEl.value) * 60;

    const checkin = await api("/checkin", {
      method: "POST",
      body: JSON.stringify({
        mood: moodScore,
        energy: energyScore,
        available_minutes: availableMinutes,
      }),
    });

    document.getElementById("capacityTag").textContent =
      `capacity ${checkin.adjusted_capacity_minutes}m`;
    document.getElementById("aiReason").innerHTML = `<b>Studiora says:</b> ${checkin.note}`;
    document.getElementById("focusPct").textContent = `${focusEl.value}/10`;

    const plan = await api("/planner/generate", { method: "POST" });
    renderPlanList(document.getElementById("checkinPlan"), plan.items);
    renderPlanList(document.getElementById("todayPlan"), plan.items);
    updatePlanProgress(plan.items);
    document.getElementById("planMode").textContent =
      energyScore <= 2 ? "light" : energyScore >= 4 ? "intense" : "balanced";

    toast("Today's plan generated ✓");
  } catch (err) {
    console.error(err);
    toast("Couldn't generate plan — check backend is running.");
  }
});

function renderPlanList(ulEl, items) {
  ulEl.innerHTML = items
    .map(
      (it) => `
      <li data-topic="${it.topic_id}">
        <span class="dot"></span>
        <div>
          <div>${it.topic_name}</div>
          <small class="hint">${it.subject_name} — ${it.reason}</small>
        </div>
        <span class="meta">${it.allocated_minutes}m</span>
      </li>`
    )
    .join("");

  ulEl.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => li.classList.toggle("done"));
  });
}

function updatePlanProgress(items) {
  const bar = document.getElementById("planProgress");
  const total = items.length || 1;
  let done = 0;
  const timer = setInterval(() => {
    const doneNow = document.querySelectorAll("#todayPlan li.done").length;
    bar.style.width = `${Math.round((doneNow / total) * 100)}%`;
  }, 400);
}

// ---------------------------------------------------------
// 4. DASHBOARD  (pulls from /planner/today, /weakzones, /analytics/summary)
// ---------------------------------------------------------
async function loadDashboard() {
  try {
    const [plan, weak, summary] = await Promise.all([
      api("/planner/today"),
      api("/weakzones"),
      api("/analytics/summary").catch(() => null), // optional, in case not implemented yet
    ]);

    renderPlanList(document.getElementById("todayPlan"), plan.items);
    document.getElementById("sExam").textContent = "—"; // filled by triage section instead

    if (summary) {
      document.getElementById("sMastered").textContent = summary.topics_mastered ?? 0;
      document.getElementById("sHours").textContent =
        Math.round((summary.total_study_minutes || 0) / 60);
      document.getElementById("sRetention").textContent =
        summary.avg_quiz_score != null ? `${Math.round(summary.avg_quiz_score)}%` : "—";
      document.getElementById("streakDays").textContent = summary.current_streak_days ?? 0;
    }

    document.getElementById("sMasteredOf").textContent = `${weak.length} flagged weak`;
  } catch (err) {
    console.error(err);
  }
}

// ---------------------------------------------------------
// 5. WEAK ZONE RADAR  (GET /weakzones)
// ---------------------------------------------------------
async function loadWeakZones() {
  try {
    const weak = await api("/weakzones");
    drawRadar(weak);

    document.getElementById("patternList").innerHTML = weak
      .map(
        (w) => `
        <li>
          ${w.topic_name || w.topic_id} — severity ${w.severity}/5
          <div class="bar"><i style="width:${w.severity * 20}%"></i></div>
        </li>`
      )
      .join("") || "<li>No weak topics detected yet — submit a quiz to see this fill in.</li>";

    document.getElementById("fixList").innerHTML = weak
      .map((w) => `<li><span class="dot"></span> ${w.reason}</li>`)
      .join("") || "";

    loadConfidenceMatrix();
  } catch (err) {
    console.error(err);
  }
}

async function loadConfidenceMatrix() {
  try {
    const matrix = await api("/analytics/confidence-matrix");

    document.getElementById("matrixDanger").innerHTML =
      matrix.danger_zone
        .map(
          (m) => `
        <li>
          <span class="dot" style="background:var(--rose)"></span>
          <div>
            <div>${m.topic_name}</div>
            <small class="hint">${m.message}</small>
          </div>
          <span class="meta">gap ${m.gap}</span>
        </li>`
        )
        .join("") || "<li><small class='hint'>No danger-zone topics yet — good sign.</small></li>";

    document.getElementById("matrixHidden").innerHTML =
      matrix.hidden_strength
        .map(
          (m) => `
        <li>
          <span class="dot" style="background:var(--sky)"></span>
          <div>
            <div>${m.topic_name}</div>
            <small class="hint">${m.message}</small>
          </div>
          <span class="meta">gap ${m.gap}</span>
        </li>`
        )
        .join("") || "<li><small class='hint'>Nothing here yet.</small></li>";
  } catch (err) {
    console.error(err);
  }
}

function drawRadar(weak) {
  const canvas = document.getElementById("radar");
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2, cy = canvas.height / 2, r = 170;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const labels = weak.length ? weak.map((w) => w.topic_name || w.topic_id) : ["No data"];
  const values = weak.length ? weak.map((w) => w.severity / 5) : [0];
  const n = labels.length;

  ctx.strokeStyle = "#2a3646";
  for (let ring = 1; ring <= 4; ring++) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      const rr = (r * ring) / 4;
      const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.beginPath();
  values.forEach((v, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + r * v * Math.cos(a), y = cy + r * v * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(242,100,122,.25)";
  ctx.strokeStyle = "#f2647a";
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#93a1b5";
  ctx.font = "11px Inter";
  labels.forEach((label, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + (r + 20) * Math.cos(a), y = cy + (r + 20) * Math.sin(a);
    ctx.fillText(label, x - 20, y);
  });
}

// ---------------------------------------------------------
// 6. FORGETTING CURVE / RETENTION
//    NOTE: backend does not yet expose a dedicated retention endpoint.
//    Using topic confidence + times_studied from /syllabus/topics as a
//    stand-in signal until Person 4/2 add a real /retention route.
// ---------------------------------------------------------
async function loadRetention() {
  try {
    const topics = await api("/syllabus/topics");
    drawCurve(topics);

    const due = topics.filter((t) => t.confidence <= 2);
    document.getElementById("revCount").textContent = `${due.length} due`;
    document.getElementById("revisionTable").innerHTML =
      `<div class="tr head"><div>Topic</div><div>Confidence</div><div>Studied</div><div>Status</div></div>` +
      due
        .map(
          (t) => `
        <div class="tr">
          <div>${t.name}</div>
          <div>${t.confidence}/5</div>
          <div>${t.times_studied}x</div>
          <div><span class="pill high">revise</span></div>
        </div>`
        )
        .join("");
  } catch (err) {
    console.error(err);
  }
}

function drawCurve(topics) {
  const canvas = document.getElementById("curve");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width, h = canvas.height, pad = 40;

  ctx.strokeStyle = "#2a3646";
  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.stroke();

  const avgConfidence = topics.length
    ? topics.reduce((s, t) => s + t.confidence, 0) / topics.length
    : 3;
  const strength = avgConfidence + 1;

  ctx.beginPath();
  ctx.strokeStyle = "#f5a524";
  ctx.lineWidth = 2;
  for (let day = 0; day <= 14; day++) {
    const retention = Math.exp(-day / strength);
    const x = pad + (day / 14) * (w - pad * 2);
    const y = h - pad - retention * (h - pad * 2);
    day === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ---------------------------------------------------------
// 7. EXAM TRIAGE  (GET /triage — add exam via /syllabus/topics with exam_date)
// ---------------------------------------------------------
document.getElementById("exReady").addEventListener("input", (e) => {
  document.getElementById("lblReady").textContent = e.target.value;
});

document.getElementById("addExam").addEventListener("click", async () => {
  try {
    const subjectName = document.getElementById("exSubject").value.trim();
    if (!subjectName) return toast("Enter a subject name first.");
    const days = Number(document.getElementById("exDays").value);
    const examDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

    let subjects = await api("/syllabus/subjects");
    let subject = subjects.find((s) => s.name === subjectName);
    if (!subject) subject = await api("/syllabus/subjects", { method: "POST", body: JSON.stringify({ name: subjectName }) });

    await api("/syllabus/topics", {
      method: "POST",
      body: JSON.stringify({
        subject_id: subject.id,
        name: `${subjectName} exam prep`,
        exam_date: examDate,
        difficulty: 3,
      }),
    });

    toast("Added to triage ✓");
    loadTriage();
  } catch (err) {
    console.error(err);
    toast("Couldn't add exam.");
  }
});

async function loadTriage() {
  try {
    const results = await api("/triage");
    document.getElementById("triageList").innerHTML = results
      .map(
        (r) => `
      <li>
        <div class="t-top"><span>${r.topic_name}</span><span>${r.urgency_score.toFixed(1)}</span></div>
        <small>${r.subject_name} • ${r.days_to_exam ?? "—"} days left • ${r.recommendation}</small>
      </li>`
      )
      .join("") || "<li>No exams triaged yet — add one on the left.</li>";

    if (results.length) {
      const soonest = [...results].sort((a, b) => (a.days_to_exam ?? 999) - (b.days_to_exam ?? 999))[0];
      document.getElementById("sExam").textContent = `${soonest.days_to_exam ?? "—"}d`;
      document.getElementById("sExamName").textContent = soonest.subject_name;
    }
  } catch (err) {
    console.error(err);
  }
}

// ---------------------------------------------------------
// 8. SYLLABUS PLANNER  (paste text -> create subjects/topics -> /planner/generate for schedule)
// ---------------------------------------------------------
document.getElementById("browseBtn").addEventListener("click", () => document.getElementById("fileInput").click());

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const result = await apiUpload("/syllabus/upload", file);
    toast(`Extracted ${result.topics_created} topics — please review.`);
    renderScheduleFromTopics(result.topics);
  } catch (err) {
    console.error(err);
    toast("PDF parsing failed — try pasting topics as text instead.");
  }
});

document.getElementById("extractBtn").addEventListener("click", async () => {
  const raw = document.getElementById("syllabusText").value.trim();
  if (!raw) return toast("Paste some topics first, one per line.");

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const subjectCache = {};
  const created = [];

  try {
    const existing = await api("/syllabus/subjects");
    existing.forEach((s) => (subjectCache[s.name] = s.id));

    for (const line of lines) {
      const [subjectName, topicName] = line.split(":").map((s) => s.trim());
      if (!subjectName || !topicName) continue;

      if (!subjectCache[subjectName]) {
        const subj = await api("/syllabus/subjects", { method: "POST", body: JSON.stringify({ name: subjectName }) });
        subjectCache[subjectName] = subj.id;
      }
      const topic = await api("/syllabus/topics", {
        method: "POST",
        body: JSON.stringify({ subject_id: subjectCache[subjectName], name: topicName, difficulty: 3 }),
      });
      created.push(topic);
    }
    toast(`Created ${created.length} topics ✓`);
    renderScheduleFromTopics(created);
  } catch (err) {
    console.error(err);
    toast("Couldn't save topics — check backend.");
  }
});

function renderScheduleFromTopics(topics) {
  document.getElementById("topicCount").textContent = `${topics.length} topics`;
  document.getElementById("scheduleTable").innerHTML =
    `<div class="tr head"><div>Topic</div><div>Difficulty</div><div>Exam date</div><div>Status</div></div>` +
    topics
      .map(
        (t) => `
      <div class="tr">
        <div>${t.name}</div>
        <div>${t.difficulty}/5</div>
        <div>${t.exam_date || "—"}</div>
        <div><span class="pill med">${t.status}</span></div>
      </div>`
      )
      .join("");
}

async function loadPlannerTopics() {
  try {
    const topics = await api("/syllabus/topics");
    if (topics.length) renderScheduleFromTopics(topics);
  } catch (err) {
    console.error(err);
  }
}

// ---------------------------------------------------------
// 9. MOCK TEST  (uses existing topics as quiz subjects, submits via /quiz/submit)
// ---------------------------------------------------------
async function loadMockSetup() {
  try {
    const subjects = await api("/syllabus/subjects");
    document.getElementById("mockSubject").innerHTML = subjects
      .map((s) => `<option value="${s.id}">${s.name}</option>`)
      .join("") || "<option disabled>Add a subject first</option>";
  } catch (err) {
    console.error(err);
  }
}

document.getElementById("genMock").addEventListener("click", async () => {
  const subjectId = document.getElementById("mockSubject").value;
  if (!subjectId) return toast("Add a subject in the Planner tab first.");

  const topics = await api(`/syllabus/topics?subject_id=${subjectId}`);
  if (!topics.length) return toast("No topics found for this subject yet.");

  const count = Number(document.getElementById("mockCount").value);
  const picked = topics.slice(0, count);

  document.getElementById("mockCard").hidden = false;
  document.getElementById("quiz").innerHTML = picked
    .map(
      (t, i) => `
    <div class="q" data-topic="${t.id}">
      <p><b>Q${i + 1}.</b> Quick check: how confident are you on <b>${t.name}</b>?</p>
      <label><input type="radio" name="q${i}" value="90" /> Very confident</label>
      <label><input type="radio" name="q${i}" value="60" /> Somewhat confident</label>
      <label><input type="radio" name="q${i}" value="30" /> Not confident</label>
    </div>`
    )
    .join("");
  document.getElementById("quizResult").hidden = true;
});

document.getElementById("submitQuiz").addEventListener("click", async () => {
  const questions = document.querySelectorAll("#quiz .q");
  let submitted = 0, totalScore = 0;

  for (const q of questions) {
    const topicId = q.dataset.topic;
    const checked = q.querySelector("input:checked");
    if (!checked) continue;
    const score = Number(checked.value);
    totalScore += score;
    submitted++;

    try {
      const quizResult = await api("/quiz/submit", {
        method: "POST",
        body: JSON.stringify({ topic_id: topicId, score_pct: score, error_tags: score < 60 ? ["conceptual"] : [] }),
      });
      if (quizResult.confidence_matrix && quizResult.confidence_matrix.quadrant === "danger_zone") {
        toast("⚠️ " + quizResult.confidence_matrix.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const avg = submitted ? Math.round(totalScore / submitted) : 0;
  const resultEl = document.getElementById("quizResult");
  resultEl.hidden = false;
  resultEl.innerHTML = `Scored ~${avg}% average. Weak zones have been updated — check the <b>Weak Zone Radar</b> tab.`;
  toast("Quiz submitted ✓");
});

// ---------------------------------------------------------
// 10. FLORA CHATBOT  (POST /chatbot/ask, GET /chatbot/history)
// ---------------------------------------------------------
async function loadChatHistory() {
  try {
    const history = await api("/chatbot/history");
    const chatEl = document.getElementById("chat");
    chatEl.innerHTML = history
      .map((m) => `<div class="msg ${m.role === "user" ? "me" : "bot"}">${m.content}</div>`)
      .join("");
    chatEl.scrollTop = chatEl.scrollHeight;
  } catch (err) {
    console.error(err);
  }
}

function appendMsg(role, content) {
  const chatEl = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = `msg ${role === "user" ? "me" : "bot"}`;
  div.textContent = content;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendToFlora(message) {
  appendMsg("user", message);
  document.getElementById("chatText").value = "";

  const chatEl = document.getElementById("chat");
  const typingDiv = document.createElement("div");
  typingDiv.className = "msg bot typing";
  typingDiv.innerHTML = "<span></span><span></span><span></span>";
  chatEl.appendChild(typingDiv);
  chatEl.scrollTop = chatEl.scrollHeight;

  try {
    const res = await api("/chatbot/ask", { method: "POST", body: JSON.stringify({ message }) });
    typingDiv.remove();
    appendMsg("assistant", res.reply);
    if (res.flagged_for_wellbeing) {
      toast("Flora flagged this check-in for wellbeing support.");
    }
  } catch (err) {
    typingDiv.remove();
    appendMsg("assistant", "Sorry, I couldn't connect right now — please try again.");
    console.error(err);
  }
}

document.getElementById("chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("chatText").value.trim();
  if (text) sendToFlora(text);
});

document.getElementById("suggestions").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) sendToFlora(chip.textContent);
});

// ---------------------------------------------------------
// 11. RESET DEMO DATA (just re-runs auth + reloads current view)
// ---------------------------------------------------------
document.getElementById("resetBtn").addEventListener("click", async () => {
  toast("Reloading demo data…");
  await loadDashboard();
});

// ---------------------------------------------------------
// 12. BOOT
// ---------------------------------------------------------
(async function init() {
  try {
    await ensureAuth();
    showView("dashboard");
    toast("Connected to Studiora backend ✓");
  } catch (err) {
    console.error(err);
    toast("Backend not reachable — start the FastAPI server on :8000.");
  }
})();
