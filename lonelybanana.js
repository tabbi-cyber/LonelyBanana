const button = document.getElementById("comfort-btn");
const banana = document.getElementById("banana");
const totalEl = document.getElementById("total");
const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");

function setStatus(text) {
  statusEl.textContent = text;
}

const DB_ERROR = "Cannot reach the database. Open check.php to find the problem.";

let savedTotal = 0;   // the total the database last told us
let pending = 0;      // taps not yet saved to the database
let sending = false;

// Messages that change as Lonely Banana gets more comfort
const messages = [
  { at: 0,   text: "Lonely Banana is waiting for a friend." },
  { at: 1,   text: "Lonely Banana noticed you." },
  { at: 10,  text: "Lonely Banana is feeling a little better." },
  { at: 50,  text: "Lonely Banana is smiling." },
  { at: 100, text: "Lonely Banana feels loved." },
  { at: 250, text: "Lonely Banana is not lonely anymore." }
];

function render() {
  const shown = savedTotal + pending;
  totalEl.textContent = shown.toLocaleString();
  let current = messages[0].text;
  for (const m of messages) {
    if (shown >= m.at) current = m.text;
  }
  messageEl.textContent = current;
}

// Send waiting taps to the database (every 0.3 seconds)
async function flush() {
  if (sending || pending === 0) return;
  sending = true;
  const batch = pending;
  pending = 0;
  try {
    const res = await fetch("api/tap.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: Math.min(batch, 1000) })
    });
    if (!res.ok) throw new Error("save failed");
    const data = await res.json();
    savedTotal = data.total;
    pending += Math.max(0, batch - 1000); // anything over the limit goes next round
    setStatus("");
  } catch (err) {
    pending += batch; // keep the taps and try again
    setStatus(DB_ERROR);
  }
  sending = false;
  render();
}

// Read the real total (shows taps from other visitors too)
async function refresh() {
  try {
    const res = await fetch("api/count.php", { cache: "no-store" });
    if (!res.ok) throw new Error("load failed");
    const data = await res.json();
    savedTotal = data.total;
    setStatus("");
    render();
  } catch (err) {
    setStatus(DB_ERROR);
  }
}

button.addEventListener("click", () => {
  pending++;
  render(); // instant feedback

  banana.classList.add("bounce");
  setTimeout(() => banana.classList.remove("bounce"), 120);
});

setInterval(flush, 300);
setInterval(() => { if (pending === 0 && !sending) refresh(); }, 5000);

// Try to save any waiting taps if the tab closes
window.addEventListener("pagehide", () => {
  if (pending > 0) {
    navigator.sendBeacon(
      "api/tap.php",
      new Blob([JSON.stringify({ count: Math.min(pending, 1000) })], { type: "application/json" })
    );
  }
});

refresh();

// ---------- Mobile menu (three-line icon) ----------
const menuToggle = document.getElementById("menu-toggle");
const siteMenu = document.getElementById("site-menu");

function setMenu(open) {
  siteMenu.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

menuToggle.addEventListener("click", () => {
  setMenu(!siteMenu.classList.contains("open"));
});

// Close after choosing a link
siteMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

// Close with Escape, or by tapping outside the menu
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});
document.addEventListener("click", (e) => {
  if (!siteMenu.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
});