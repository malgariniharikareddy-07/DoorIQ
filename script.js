
const scenarios = {
  delivery: {
    label: "Delivery", icon: "📦", kicker: "DELIVERY EVENT",
    urgency: "LOW INTERRUPT", level: "calm",
    recs: {
      busy: ["A delivery may be arriving", "If permitted, use your saved delivery instructions to request a drop-off at your designated safe place.", "You are busy, so a low-interruption suggestion is shown."],
      available: ["Check the delivery", "Review the authorized doorbell view or respond through your normal process. Confirm the package location afterward.", "You are available, so DoorIQ suggests checking the delivery."],
      safe: ["Review your delivery preferences", "Use only a location you have designated as safe. Avoid sharing access codes or sensitive details.", "Your safety-first preference prioritizes privacy."]
    }
  },
  guest: {
    label: "Expected guest", icon: "👋", kicker: "EXPECTED VISITOR",
    urgency: "NORMAL", level: "calm",
    recs: {
      busy: ["An expected guest may be here", "Send a quick message to let them know you are busy, or use your saved arrival instructions.", "You are busy, so a low-interruption response is suggested."],
      available: ["Welcome your guest", "Respond through your normal process and confirm that the visitor is the person you expected.", "You are available, so DoorIQ suggests responding when ready."],
      safe: ["Verify before responding", "Check your expected-visitor details before sharing information or granting access.", "Your safety-first preference keeps access decisions under your control."]
    }
  },
  unknown: {
    label: "Unknown visitor", icon: "🔔", kicker: "UNRECOGNIZED EVENT",
    urgency: "REVIEW CAREFULLY", level: "medium",
    recs: {
      busy: ["An unrecognized visitor was detected", "You do not need to respond immediately. Review the event details when you can.", "You are busy, so DoorIQ suggests reviewing later rather than rushing."],
      available: ["Review the visitor event", "Use your normal authorized process to assess the situation. Do not unlock the door automatically.", "You remain in control of access decisions."],
      safe: ["Prioritize safety and privacy", "Do not share personal details or grant access based only on an alert. Follow your normal household safety process.", "Your safety-first preference emphasizes caution and privacy."]
    }
  },
  bell: {
    label: "Doorbell pressed", icon: "🚪", kicker: "DOORBELL EVENT",
    urgency: "NORMAL", level: "calm",
    recs: {
      busy: ["Someone rang the doorbell", "If you cannot respond now, check the event later or use your saved visitor instructions.", "You are busy, so the suggestion avoids unnecessary interruption."],
      available: ["Respond when ready", "Check who is at the door through your normal, authorized process before opening it.", "You are available, so DoorIQ suggests checking the event."],
      safe: ["Check before taking action", "Review the event and follow your household safety preferences. Keep access decisions under your control.", "Your safety-first preference keeps you in control."]
    }
  }
};

let currentEvent = "delivery";
let count = 0;
let history = [];

const $ = id => document.getElementById(id);

const preferenceNames = {
  busy: "Busy",
  available: "Available",
  safe: "Safety-first"
};

function addHistory(eventKey, pref, recommendation, status = "Reviewed") {
  history.unshift({
    event: scenarios[eventKey].label,
    pref: preferenceNames[pref],
    rec: recommendation,
    status
  });
  count++;
  $("eventCount").textContent = String(count).padStart(2, "0");
  renderHistory();
}

document.querySelectorAll(".event-option").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".event-option").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    currentEvent = button.dataset.event;
  });
});

function translate() {
  const pref = $("preference").value;
  const scenario = scenarios[currentEvent];
  const recommendation = scenario.recs[pref];
  const note = $("customNote").value.trim();

  $("recIcon").textContent = scenario.icon;
  $("recKicker").textContent = scenario.kicker;
  $("recTitle").textContent = recommendation[0];
  $("recBody").textContent = recommendation[1];
  $("whyText").textContent = recommendation[2];
  $("urgency").textContent = scenario.urgency;
  $("urgency").className = "urgency " + scenario.level;

  $("personalNote").textContent = note
    ? `Your household note: "${note}" — check that it is appropriate and safe before using it.`
    : "";
  $("personalNote").classList.toggle("hidden", !note);

  $("actionStatus").textContent = "No action taken — this is a recommendation only.";
  addHistory(currentEvent, pref, recommendation[0]);
}

function renderHistory() {
  const root = $("history");

  if (!history.length) {
    root.innerHTML = '<div class="empty-history"><span>✧</span><b>Your activity will show up here</b><p>Try a scenario above to create your first demo event.</p></div>';
    return;
  }

  root.innerHTML = history.slice(0, 8).map(item =>
    `<div class="activity-row">
      <span><b>${escapeHtml(item.event)}</b></span>
      <span>${escapeHtml(item.pref)}</span>
      <span>${escapeHtml(item.rec)}</span>
      <span><span class="status-pill">${escapeHtml(item.status)}</span></span>
    </div>`
  ).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

$("translateBtn").addEventListener("click", translate);

$("markDone").addEventListener("click", () => {
  $("actionStatus").textContent = "Marked as reviewed in this demo session. No real-world action was performed.";
  if (history.length) {
    history[0].status = "Reviewed";
    renderHistory();
  }
});

$("saveRule").addEventListener("click", () => {
  const pref = $("preference").value;
  const names = {
    busy: "Low-interruption",
    available: "Available to respond",
    safe: "Safety-first"
  };
  $("actionStatus").textContent = `Preference "${names[pref]}" saved for this browser session only.`;
  $("saveRule").textContent = "★ Preference saved";
});

$("clearHistory").addEventListener("click", () => {
  history = [];
  count = 0;
  $("eventCount").textContent = "00";
  renderHistory();
  $("actionStatus").textContent = "Demo history cleared.";
});

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  $("themeBtn").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
});

// Conversational assistant: rule-based intent recognition, no external AI API.
function understandMessage(message) {
  const text = message.toLowerCase();

  let event = "bell";

  if (/\b(delivery|deliver|parcel|package|courier|shipment)\b/.test(text)) {
    event = "delivery";
  } else if (/\b(unknown visitor|stranger|unrecognized visitor|someone i don't know|someone i do not know|unknown person)\b/.test(text)) {
    event = "unknown";
  } else if (/\b(guest|friend|relative|expected visitor|visitor i expect)\b/.test(text)) {
    event = "guest";
  } else if (/\b(doorbell|rang|ringing|someone is at the door|someone at my door)\b/.test(text)) {
    event = "bell";
  } else if (/\b(visitor|stranger)\b/.test(text)) {
    event = "unknown";
  }

  let pref = $("preference").value;

  if (/\b(safety|safe|privacy|private|cautious|security|protect)\b/.test(text)) {
    pref = "safe";
  } else if (/\b(busy|meeting|working|occupied|can't respond|cannot respond|do not disturb)\b/.test(text)) {
    pref = "busy";
  } else if (/\b(available|free now|ready to respond|i can respond)\b/.test(text)) {
    pref = "available";
  }

  return { event, pref };
}

function addChatMessage(message, type) {
  const container = $("chatMessages");
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${type}-message`;

  const heading = document.createElement("b");
  heading.textContent = type === "user" ? "You" : "DoorIQ";

  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  bubble.append(heading, paragraph);
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function answerMessage(message) {
  const intent = understandMessage(message);
  const scenario = scenarios[intent.event];
  const recommendation = scenario.recs[intent.pref];

  // Keep the existing playground in sync with the conversation.
  currentEvent = intent.event;
  document.querySelectorAll(".event-option").forEach(button => {
    button.classList.toggle("selected", button.dataset.event === intent.event);
  });
  $("preference").value = intent.pref;

  // Update the recommendation card with the same contextual answer.
  $("recIcon").textContent = scenario.icon;
  $("recKicker").textContent = scenario.kicker;
  $("recTitle").textContent = recommendation[0];
  $("recBody").textContent = recommendation[1];
  $("whyText").textContent = recommendation[2];
  $("urgency").textContent = scenario.urgency;
  $("urgency").className = "urgency " + scenario.level;

  const note = $("customNote").value.trim();
  $("personalNote").textContent = note
    ? `Your household note: "${note}" — check that it is appropriate and safe before using it.`
    : "";
  $("personalNote").classList.toggle("hidden", !note);
  $("actionStatus").textContent = "No action taken — this is a recommendation only.";

  addHistory(intent.event, intent.pref, recommendation[0]);

  const response = `${recommendation[0]}. ${recommendation[1]} Why: ${recommendation[2]} Remember, this is a suggestion only. DoorIQ has not contacted anyone or changed your door settings.`;
  addChatMessage(response, "assistant");
}

$("chatForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("chatInput");
  const message = input.value.trim();

  if (!message) return;

  addChatMessage(message, "user");
  input.value = "";
  answerMessage(message);
});

document.querySelectorAll(".prompt-btn").forEach(button => {
  button.addEventListener("click", () => {
    const message = button.dataset.prompt;
    addChatMessage(message, "user");
    answerMessage(message);
  });
});

$("chatInput").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("chatForm").requestSubmit();
  }
});
