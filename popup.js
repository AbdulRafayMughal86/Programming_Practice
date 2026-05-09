const scanButton = document.getElementById("scanPage");
const clearButton = document.getElementById("clearHighlights");
const statusElement = document.getElementById("status");
const totalScannedElement = document.getElementById("totalScanned");
const suspiciousCountElement = document.getElementById("suspiciousCount");
const classCountsElement = document.getElementById("classCounts");

const DARK_PATTERN_CLASSES = [
  "urgency",
  "scarcity",
  "confirmshaming",
  "forced_action",
  "hidden_costs",
  "misleading_cta"
];

function setStatus(message) {
  statusElement.textContent = message;
}

function renderClassCounts(countsByClass = {}) {
  classCountsElement.innerHTML = "";

  for (const className of DARK_PATTERN_CLASSES) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const count = document.createElement("strong");

    label.textContent = className.replace("_", " ");
    count.textContent = countsByClass[className] || 0;

    item.append(label, count);
    classCountsElement.appendChild(item);
  }
}

function renderSummary(summary) {
  totalScannedElement.textContent = summary.totalScanned;
  suspiciousCountElement.textContent = summary.suspiciousCount;
  renderClassCounts(summary.countsByClass);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendMessageToActiveTab(message) {
  const tab = await getActiveTab();
  if (!tab?.id) {
    throw new Error("No active tab found.");
  }

  return chrome.tabs.sendMessage(tab.id, message);
}

scanButton.addEventListener("click", async () => {
  scanButton.disabled = true;
  setStatus("Scanning visible webpage text locally...");

  try {
    const response = await sendMessageToActiveTab({ type: "SCAN_PAGE" });
    if (!response?.ok) {
      throw new Error(response?.error || "The page could not be scanned.");
    }

    renderSummary(response.summary);
    setStatus(`Scan complete. Threshold: ${response.summary.threshold}`);
  } catch (error) {
    setStatus(`Unable to scan this page: ${error.message}`);
  } finally {
    scanButton.disabled = false;
  }
});

clearButton.addEventListener("click", async () => {
  try {
    await sendMessageToActiveTab({ type: "CLEAR_HIGHLIGHTS" });
    renderSummary({ totalScanned: 0, suspiciousCount: 0, countsByClass: {} });
    setStatus("Highlights cleared.");
  } catch (error) {
    setStatus(`Unable to clear highlights: ${error.message}`);
  }
});

renderClassCounts();
