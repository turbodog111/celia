// === Celia — app.js ===

const LS_ENDPOINT = 'celia_endpoint';
const LS_THEME = 'celia_theme';
const LS_SYSTEM = 'celia_system_prompt';
const LS_CHAT = 'celia_chat';

const DEFAULT_ENDPOINT = 'http://spark-0af9:8080';

// ── State ────────────────────────────────────────────────────────────────────

let endpoint = localStorage.getItem(LS_ENDPOINT) || DEFAULT_ENDPOINT;
let systemPrompt = localStorage.getItem(LS_SYSTEM) || '';
let messages = []; // {role, content}
let streaming = false;
let abortCtrl = null;

// ── DOM ──────────────────────────────────────────────────────────────────────

const $chatArea     = document.getElementById('chatArea');
const $chatEmpty    = document.getElementById('chatEmpty');
const $msgInput     = document.getElementById('msgInput');
const $sendBtn      = document.getElementById('sendBtn');
const $modelSelect  = document.getElementById('modelSelect');
const $statusDot    = document.getElementById('statusDot');
const $headerSub    = document.getElementById('headerSub');
const $typingInd    = document.getElementById('typingIndicator');
const $typingLabel  = document.getElementById('typingLabel');

// Guide
const $guideToggle  = document.getElementById('guideToggle');
const $guideBody    = document.getElementById('guideBody');
const $guideChevron = document.getElementById('guideChevron');
const $guideModels  = document.getElementById('guideModelList');

// Settings
const $settingsBtn    = document.getElementById('settingsBtn');
const $settingsModal  = document.getElementById('settingsModal');
const $settingsCancel = document.getElementById('settingsCancel');
const $settingsSave   = document.getElementById('settingsSave');
const $endpointInput  = document.getElementById('endpointInput');
const $systemInput    = document.getElementById('systemPromptInput');
const $themeSelect    = document.getElementById('themeSelect');
const $clearBtn       = document.getElementById('clearBtn');

// ── Theme ────────────────────────────────────────────────────────────────────

function applyTheme(t) {
  const resolved = t === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : t;
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(LS_THEME, t);
}
$themeSelect.value = localStorage.getItem(LS_THEME) || 'system';

// ── Guide Toggle ─────────────────────────────────────────────────────────────

$guideToggle.addEventListener('click', () => {
  $guideBody.classList.toggle('open');
  $guideChevron.classList.toggle('open');
});

// ── Settings Modal ───────────────────────────────────────────────────────────

$settingsBtn.addEventListener('click', () => {
  $endpointInput.value = endpoint;
  $systemInput.value = systemPrompt;
  $themeSelect.value = localStorage.getItem(LS_THEME) || 'system';
  $settingsModal.classList.add('open');
});
$settingsCancel.addEventListener('click', () => $settingsModal.classList.remove('open'));
$settingsModal.addEventListener('click', (e) => {
  if (e.target === $settingsModal) $settingsModal.classList.remove('open');
});
$settingsSave.addEventListener('click', () => {
  endpoint = $endpointInput.value.replace(/\/+$/, '') || DEFAULT_ENDPOINT;
  systemPrompt = $systemInput.value.trim();
  localStorage.setItem(LS_ENDPOINT, endpoint);
  localStorage.setItem(LS_SYSTEM, systemPrompt);
  applyTheme($themeSelect.value);
  $settingsModal.classList.remove('open');
  loadModels();
});

// ── Clear Chat ───────────────────────────────────────────────────────────────

$clearBtn.addEventListener('click', () => {
  if (streaming) return;
  messages = [];
  localStorage.removeItem(LS_CHAT);
  renderChat();
});

// ── Model Loading ────────────────────────────────────────────────────────────

async function loadModels() {
  $statusDot.className = 'status-dot loading';
  $modelSelect.innerHTML = '<option value="">Connecting...</option>';
  $headerSub.textContent = 'Connecting...';

  try {
    const resp = await fetch(`${endpoint}/v1/models`, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    const models = data.data || [];

    if (models.length === 0) {
      $modelSelect.innerHTML = '<option value="">No models found</option>';
      $statusDot.className = 'status-dot disconnected';
      $headerSub.textContent = 'No models available';
      updateGuideModels([]);
      return;
    }

    // Sort: loaded first, then alphabetical
    models.sort((a, b) => {
      const al = a.status?.value === 'loaded' ? 0 : 1;
      const bl = b.status?.value === 'loaded' ? 0 : 1;
      if (al !== bl) return al - bl;
      return a.id.localeCompare(b.id);
    });

    $modelSelect.innerHTML = models.map(m => {
      const loaded = m.status?.value === 'loaded' ? ' [loaded]' : '';
      return `<option value="${m.id}">${m.id}${loaded}</option>`;
    }).join('');

    // Default to first loaded model
    const loaded = models.find(m => m.status?.value === 'loaded');
    if (loaded) $modelSelect.value = loaded.id;

    $statusDot.className = 'status-dot connected';
    $headerSub.textContent = `${models.length} models available`;
    updateGuideModels(models);

  } catch (e) {
    $modelSelect.innerHTML = '<option value="">Connection failed</option>';
    $statusDot.className = 'status-dot disconnected';
    $headerSub.textContent = 'Unable to reach server';
    updateGuideModels([]);
  }
}

function updateGuideModels(models) {
  if (models.length === 0) {
    $guideModels.innerHTML = `<div class="guide-model-row"><span class="guide-model-name">No models</span><span class="guide-model-desc">Check endpoint in Settings</span></div>`;
    return;
  }
  $guideModels.innerHTML = models.map(m => {
    const isLoaded = m.status?.value === 'loaded';
    return `<div class="guide-model-row${isLoaded ? ' guide-model-best' : ''}">
      <span class="guide-model-name">${m.id}${isLoaded ? ' &#9889;' : ''}</span>
      <span class="guide-model-desc">${isLoaded ? 'loaded' : 'available'}</span>
    </div>`;
  }).join('');
}

// ── Chat Rendering ───────────────────────────────────────────────────────────

function renderChat() {
  // Remove empty state if messages exist
  if (messages.length > 0 && $chatEmpty) {
    $chatEmpty.style.display = 'none';
  } else if ($chatEmpty) {
    $chatEmpty.style.display = '';
  }

  // Clear and re-render all messages
  const existing = $chatArea.querySelectorAll('.message');
  existing.forEach(el => el.remove());

  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `message ${msg.role === 'user' ? 'user' : 'assistant'}`;

    const letter = msg.role === 'user' ? 'U' : 'C';
    div.innerHTML = `
      <div class="msg-avatar-letter">${letter}</div>
      <div class="msg-content">
        <div class="msg-name">${msg.role === 'user' ? 'You' : $modelSelect.value || 'Model'}</div>
        <div class="msg-bubble">${escapeHtml(msg.content)}</div>
      </div>
    `;
    $chatArea.insertBefore(div, $typingInd);
  });

  $chatArea.scrollTop = $chatArea.scrollHeight;
}

function appendAssistantToken(token) {
  // Find last assistant message bubble
  const msgs = $chatArea.querySelectorAll('.message.assistant');
  if (msgs.length === 0) return;
  const last = msgs[msgs.length - 1];
  const bubble = last.querySelector('.msg-bubble');
  if (bubble) bubble.textContent += token;
  $chatArea.scrollTop = $chatArea.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function saveChat() {
  localStorage.setItem(LS_CHAT, JSON.stringify(messages));
}

function loadChat() {
  try {
    const raw = localStorage.getItem(LS_CHAT);
    if (raw) messages = JSON.parse(raw);
  } catch(e) {}
  renderChat();
}

// ── Sending Messages ─────────────────────────────────────────────────────────

async function sendMessage() {
  const text = $msgInput.value.trim();
  if (!text || streaming) return;

  const model = $modelSelect.value;
  if (!model) return;

  // Add user message
  messages.push({ role: 'user', content: text });
  $msgInput.value = '';
  $msgInput.style.height = 'auto';

  // Add empty assistant message
  messages.push({ role: 'assistant', content: '' });
  renderChat();

  // Show typing
  streaming = true;
  $sendBtn.disabled = true;
  $typingInd.classList.add('visible');
  $typingLabel.textContent = `${model} generating...`;

  // Build messages payload
  const apiMessages = [];
  if (systemPrompt) apiMessages.push({ role: 'system', content: systemPrompt });
  messages.slice(0, -1).forEach(m => { // exclude the empty assistant msg
    if (m.role === 'user' || (m.role === 'assistant' && m.content)) {
      apiMessages.push({ role: m.role, content: m.content });
    }
  });

  abortCtrl = new AbortController();

  try {
    const resp = await fetch(`${endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        stream: true,
        temperature: 0.85,
        max_tokens: 1024,
      }),
      signal: abortCtrl.signal,
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) {
            messages[messages.length - 1].content += token;
            appendAssistantToken(token);
          }
        } catch(e) {}
      }
    }

    // Strip any <think> blocks from the final content
    const last = messages[messages.length - 1];
    last.content = last.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  } catch (e) {
    if (e.name !== 'AbortError') {
      messages[messages.length - 1].content = `[Error: ${e.message}]`;
    }
  } finally {
    streaming = false;
    abortCtrl = null;
    $sendBtn.disabled = false;
    $typingInd.classList.remove('visible');
    saveChat();
    renderChat();
  }
}

// ── Input Handling ───────────────────────────────────────────────────────────

$sendBtn.addEventListener('click', sendMessage);
$msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
$msgInput.addEventListener('input', () => {
  $msgInput.style.height = 'auto';
  $msgInput.style.height = Math.min($msgInput.scrollHeight, 120) + 'px';
});

// ── Init ─────────────────────────────────────────────────────────────────────

loadChat();
loadModels();
