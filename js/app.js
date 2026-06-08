// Celia internal chat workbench.

const LS_ENDPOINT = "celia_endpoint";
const LS_SYSTEM = "celia_system_prompt";
const LS_CHAT = "celia_chat";
const LS_TAB = "celia_active_tab";

const DEFAULT_ENDPOINT = "http://spark-0af9:8080";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 1024;

let endpoint = localStorage.getItem(LS_ENDPOINT) || DEFAULT_ENDPOINT;
let systemPrompt = localStorage.getItem(LS_SYSTEM) || "";
let messages = [];
let streaming = false;
let abortCtrl = null;

const $chatArea = document.getElementById("chatArea");
const $chatEmpty = document.getElementById("chatEmpty");
const $composer = document.getElementById("composer");
const $msgInput = document.getElementById("msgInput");
const $sendBtn = document.getElementById("sendBtn");
const $modelSelect = document.getElementById("modelSelect");
const $connectionPill = document.getElementById("connectionPill");
const $connectionLabel = document.getElementById("connectionLabel");
const $headerSub = document.getElementById("headerSub");
const $typingInd = document.getElementById("typingIndicator");
const $typingLabel = document.getElementById("typingLabel");
const $modelHint = document.getElementById("modelHint");
const $settingsBtn = document.getElementById("settingsBtn");
const $settingsModal = document.getElementById("settingsModal");
const $settingsClose = document.getElementById("settingsClose");
const $settingsCancel = document.getElementById("settingsCancel");
const $settingsSave = document.getElementById("settingsSave");
const $endpointInput = document.getElementById("endpointInput");
const $systemInput = document.getElementById("systemPromptInput");
const $clearBtn = document.getElementById("clearBtn");
const $exportBtn = document.getElementById("exportBtn");
const $runsContent = document.getElementById("runsContent");
const $benchmarksContent = document.getElementById("benchmarksContent");
const promptButtons = Array.from(document.querySelectorAll("[data-prompt]"));
const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));

function activateTab(tabName) {
  const selected = tabPanels.some((panel) => panel.dataset.tabPanel === tabName) ? tabName : "chat";
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === selected;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === selected);
  });
  localStorage.setItem(LS_TAB, selected);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tabTarget || "chat"));
});

function setConnection(state, label, detail) {
  $connectionPill.className = `status-pill ${state}`;
  $connectionLabel.textContent = label;
  $headerSub.textContent = detail;
}

function openSettings() {
  $endpointInput.value = endpoint;
  $systemInput.value = systemPrompt;
  $settingsModal.classList.add("open");
  $settingsModal.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  $settingsModal.classList.remove("open");
  $settingsModal.setAttribute("aria-hidden", "true");
}

$settingsBtn.addEventListener("click", openSettings);
$settingsClose.addEventListener("click", closeSettings);
$settingsCancel.addEventListener("click", closeSettings);
$settingsModal.addEventListener("click", (event) => {
  if (event.target === $settingsModal) closeSettings();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && $settingsModal.classList.contains("open")) closeSettings();
});

$settingsSave.addEventListener("click", () => {
  endpoint = $endpointInput.value.replace(/\/+$/, "") || DEFAULT_ENDPOINT;
  systemPrompt = $systemInput.value.trim();
  localStorage.setItem(LS_ENDPOINT, endpoint);
  localStorage.setItem(LS_SYSTEM, systemPrompt);
  closeSettings();
  loadModels();
});

$clearBtn.addEventListener("click", () => {
  if (streaming) return;
  messages = [];
  localStorage.removeItem(LS_CHAT);
  renderChat();
});

$exportBtn.addEventListener("click", async () => {
  const transcript = messages
    .map((message) => `${message.role === "user" ? "Joshua" : "Celia"}:\n${message.content}`)
    .join("\n\n");
  try {
    await navigator.clipboard.writeText(transcript || "No transcript yet.");
    $exportBtn.textContent = "Copied";
    setTimeout(() => { $exportBtn.textContent = "Copy transcript"; }, 1400);
  } catch {
    $exportBtn.textContent = "Copy failed";
    setTimeout(() => { $exportBtn.textContent = "Copy transcript"; }, 1400);
  }
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    $msgInput.value = button.dataset.prompt || "";
    resizeComposer();
    $msgInput.focus();
  });
});

async function loadModels() {
  setConnection("loading", "Checking", "Connecting to the configured inference endpoint.");
  $modelSelect.innerHTML = '<option value="">Connecting...</option>';
  $modelHint.textContent = endpoint;

  try {
    const response = await fetch(`${endpoint}/v1/models`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const models = data.data || [];

    if (models.length === 0) {
      $modelSelect.innerHTML = '<option value="">No models found</option>';
      setConnection("disconnected", "No model", "Endpoint responded, but no models were listed.");
      return;
    }

    models.sort((a, b) => {
      const al = a.status?.value === "loaded" ? 0 : 1;
      const bl = b.status?.value === "loaded" ? 0 : 1;
      if (al !== bl) return al - bl;
      return a.id.localeCompare(b.id);
    });

    $modelSelect.innerHTML = models.map((model) => {
      const loaded = model.status?.value === "loaded" ? " [loaded]" : "";
      return `<option value="${escapeAttr(model.id)}">${escapeHtml(model.id)}${loaded}</option>`;
    }).join("");

    const loaded = models.find((model) => model.status?.value === "loaded");
    if (loaded) $modelSelect.value = loaded.id;

    setConnection("connected", "Online", `${models.length} model${models.length === 1 ? "" : "s"} available for internal testing.`);
    $modelHint.textContent = loaded ? `Loaded: ${loaded.id}` : "Model required";
  } catch (error) {
    $modelSelect.innerHTML = '<option value="">Connection failed</option>';
    setConnection("disconnected", "Offline", "Unable to reach the configured inference endpoint.");
    $modelHint.textContent = error.message || "Connection failed.";
  }
}

function renderChat() {
  if ($chatEmpty) $chatEmpty.style.display = messages.length > 0 ? "none" : "";
  $chatArea.querySelectorAll(".message").forEach((element) => element.remove());

  messages.forEach((message) => {
    const row = document.createElement("div");
    row.className = `message ${message.role === "user" ? "user" : "assistant"}`;

    const avatar = message.role === "user"
      ? '<div class="msg-avatar-letter">J</div>'
      : '<div class="msg-avatar-letter celia-avatar">C</div>';

    row.innerHTML = `
      ${avatar}
      <div class="msg-content">
        <div class="msg-name">${message.role === "user" ? "Joshua" : "Celia"}</div>
        <div class="msg-bubble">${escapeHtml(message.content)}</div>
      </div>
    `;
    $chatArea.insertBefore(row, $typingInd);
  });

  $chatArea.scrollTop = $chatArea.scrollHeight;
}

async function loadProjectState() {
  let state = window.CELIA_PROJECT_STATE || null;

  if (window.location.protocol !== "file:") {
    try {
      const response = await fetch("data/project-state.json", { cache: "no-store" });
      if (response.ok) state = await response.json();
    } catch {
      // file:// previews use data/project-state.js as a browser-safe mirror.
    }
  }

  if (!state) {
    renderStateError($runsContent, "Runs unavailable");
    renderStateError($benchmarksContent, "Benchmarks unavailable");
    return;
  }

  renderRuns(state);
  renderBenchmarks(state);
}

function renderRuns(state) {
  const runs = state.runs || {};
  const headline = runs.headline || {};
  $runsContent.innerHTML = `
    ${renderHero(headline, state)}
    ${renderCardGrid(runs.cards || [])}
    ${renderMetricStrip(runs.metrics || [])}
    <div class="state-split">
      ${renderTimeline(runs.timeline || [])}
      ${renderPaths(runs.paths || [], "Run paths")}
    </div>
  `;
}

function renderBenchmarks(state) {
  const benchmarks = state.benchmarks || {};
  const headline = benchmarks.headline || {};
  $benchmarksContent.innerHTML = `
    ${renderHero(headline, state)}
    ${renderCardGrid(benchmarks.cards || [])}
    ${renderMetricStrip(benchmarks.metrics || [])}
    ${renderBenchmarkRows(benchmarks.rows || [])}
    ${renderPaths(benchmarks.paths || [], "Benchmark paths")}
  `;
}

function renderHero(headline, state) {
  return `
    <article class="state-hero">
      <div>
        <span class="eyebrow">${escapeHtml(headline.label || "Status")}</span>
        <h2>${escapeHtml(headline.title || "No title")}</h2>
      </div>
      <div class="state-hero-side">
        <span class="status-chip ${escapeAttr(headline.tone || "gold")}">${escapeHtml(headline.status || "Unknown")}</span>
        <span class="state-updated">${escapeHtml(headline.updated || formatDate(state.updatedAt))}</span>
      </div>
      <p>${escapeHtml(headline.detail || "")}</p>
    </article>
  `;
}

function renderCardGrid(cards) {
  if (!cards.length) return "";
  return `
    <div class="board-grid">
      ${cards.map((card) => `
        <article class="board-card state-card">
          <span class="eyebrow">${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(card.value)}</strong>
          <p>${escapeHtml(card.detail || "")}</p>
          ${card.meta ? `<span class="state-meta">${escapeHtml(card.meta)}</span>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function renderMetricStrip(metrics) {
  if (!metrics.length) return "";
  return `
    <div class="metric-strip">
      ${metrics.map((metric) => `
        <article class="metric-card">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
          <small>${escapeHtml(metric.detail || "")}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function renderTimeline(items) {
  if (!items.length) return "";
  return `
    <article class="board-card state-list-card">
      <span class="eyebrow">Run sequence</span>
      <ol class="state-timeline">
        ${items.map((item) => `
          <li>
            <span class="timeline-dot"></span>
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <em>${escapeHtml(item.status)}</em>
              <p>${escapeHtml(item.detail || "")}</p>
            </div>
          </li>
        `).join("")}
      </ol>
    </article>
  `;
}

function renderBenchmarkRows(rows) {
  if (!rows.length) return "";
  return `
    <article class="board-card board-card--wide state-list-card">
      <span class="eyebrow">Benchmark ledger</span>
      <table class="data-table state-table">
        <thead>
          <tr><th>Model</th><th>Benchmark</th><th>Status</th><th>Result</th></tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <th>${escapeHtml(row.name)}</th>
              <td>${escapeHtml(row.benchmark)}</td>
              <td>${escapeHtml(row.status)}</td>
              <td>${escapeHtml(row.result)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </article>
  `;
}

function renderPaths(paths, title) {
  if (!paths.length) return "";
  return `
    <article class="board-card state-list-card">
      <span class="eyebrow">${escapeHtml(title)}</span>
      <dl class="path-list">
        ${paths.map((path) => `
          <div>
            <dt>${escapeHtml(path.label)}</dt>
            <dd>${escapeHtml(path.value)}</dd>
          </div>
        `).join("")}
      </dl>
    </article>
  `;
}

function renderStateError(target, label) {
  if (!target) return;
  target.innerHTML = `
    <article class="state-hero">
      <span class="eyebrow">${escapeHtml(label)}</span>
      <h2>State file missing</h2>
    </article>
  `;
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function appendAssistantToken(token) {
  const assistantMessages = $chatArea.querySelectorAll(".message.assistant");
  if (assistantMessages.length === 0) return;
  const last = assistantMessages[assistantMessages.length - 1];
  const bubble = last.querySelector(".msg-bubble");
  if (bubble) bubble.textContent += token;
  $chatArea.scrollTop = $chatArea.scrollHeight;
}

function saveChat() {
  localStorage.setItem(LS_CHAT, JSON.stringify(messages));
}

function loadChat() {
  try {
    const raw = localStorage.getItem(LS_CHAT);
    if (raw) messages = JSON.parse(raw);
  } catch {
    messages = [];
  }
  renderChat();
}

async function sendMessage() {
  const text = $msgInput.value.trim();
  if (!text) return;

  if (streaming) {
    abortCtrl?.abort();
    return;
  }

  const model = $modelSelect.value;
  if (!model) {
    openSettings();
    return;
  }

  messages.push({ role: "user", content: text });
  $msgInput.value = "";
  resizeComposer();
  messages.push({ role: "assistant", content: "" });
  renderChat();

  streaming = true;
  abortCtrl = new AbortController();
  $sendBtn.textContent = "Stop";
  $sendBtn.classList.add("is-stopping");
  $typingInd.classList.add("visible");
  $typingLabel.textContent = "Generating";

  const apiMessages = [];
  if (systemPrompt) apiMessages.push({ role: "system", content: systemPrompt });
  messages.slice(0, -1).forEach((message) => {
    if (message.role === "user" || (message.role === "assistant" && message.content)) {
      apiMessages.push({ role: message.role, content: message.content });
    }
  });

  try {
    const response = await fetch(`${endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
      }),
      signal: abortCtrl.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.body) throw new Error("No response stream");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      lines.forEach((line) => {
        if (!line.startsWith("data: ")) return;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) {
            messages[messages.length - 1].content += token;
            appendAssistantToken(token);
          }
        } catch {
          // Ignore partial server-sent event frames.
        }
      });
    }

    const last = messages[messages.length - 1];
    last.content = stripThinking(last.content);
  } catch (error) {
    if (error.name !== "AbortError") {
      messages[messages.length - 1].content = `[Error: ${error.message}]`;
    }
  } finally {
    streaming = false;
    abortCtrl = null;
    $sendBtn.textContent = "Send";
    $sendBtn.classList.remove("is-stopping");
    $typingInd.classList.remove("visible");
    saveChat();
    renderChat();
  }
}

function stripThinking(value) {
  return value.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function resizeComposer() {
  $msgInput.style.height = "auto";
  $msgInput.style.height = `${Math.min($msgInput.scrollHeight, 150)}px`;
}

$composer.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

$msgInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

$msgInput.addEventListener("input", resizeComposer);

loadChat();
loadProjectState();
loadModels();
activateTab(localStorage.getItem(LS_TAB) || "chat");
