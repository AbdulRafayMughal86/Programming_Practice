/*
 * Content script for scanning visible webpage text locally.
 * The classifier and model are packaged with the extension, so webpage text
 * never leaves the user's browser.
 */
const DARK_PATTERN_CONFIG = {
  // Tune this threshold for stricter or more permissive highlighting.
  suspiciousConfidenceThreshold: 0.42,
  minTextLength: 3,
  maxTextLength: 220,
  maxElementsToScan: 350,
  selectors: "h1, h2, h3, p, span, button, a, label, div, li"
};

const HIGHLIGHT_CLASS = "local-dark-pattern-highlight";
const LABEL_CLASS = "local-dark-pattern-label";

function isVisibleElement(element) {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) > 0 &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function normalizeChunk(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function getDirectVisibleText(element) {
  // innerText respects CSS visibility better than textContent in normal pages.
  return normalizeChunk(element.innerText || element.textContent || "");
}

function collectCandidateElements() {
  const elements = Array.from(document.querySelectorAll(DARK_PATTERN_CONFIG.selectors));
  const seenText = new Set();
  const candidates = [];

  for (const element of elements) {
    if (candidates.length >= DARK_PATTERN_CONFIG.maxElementsToScan) {
      break;
    }

    if (element.closest(`.${LABEL_CLASS}`) || !isVisibleElement(element)) {
      continue;
    }

    const text = getDirectVisibleText(element);
    if (text.length < DARK_PATTERN_CONFIG.minTextLength) {
      continue;
    }

    const truncatedText = text.slice(0, DARK_PATTERN_CONFIG.maxTextLength);
    const duplicateKey = truncatedText.toLowerCase();
    if (seenText.has(duplicateKey)) {
      continue;
    }

    seenText.add(duplicateKey);
    candidates.push({ element, text: truncatedText });
  }

  return candidates;
}

function injectHighlightStyles() {
  if (document.getElementById("local-dark-pattern-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "local-dark-pattern-style";
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      outline: 3px solid #f97316 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.18) !important;
      position: relative !important;
    }

    .${LABEL_CLASS} {
      display: inline-block !important;
      margin: 4px 0 !important;
      padding: 3px 6px !important;
      border-radius: 999px !important;
      color: #7c2d12 !important;
      background: #ffedd5 !important;
      border: 1px solid #fb923c !important;
      font: 700 11px/1.2 Arial, sans-serif !important;
      letter-spacing: 0.01em !important;
      z-index: 2147483647 !important;
    }
  `;
  document.documentElement.appendChild(style);
}

function highlightElement(element, result) {
  element.classList.add(HIGHLIGHT_CLASS);
  element.dataset.darkPatternClass = result.label;
  element.dataset.darkPatternConfidence = result.confidence.toFixed(3);

  const label = document.createElement("span");
  label.className = LABEL_CLASS;
  label.textContent = `${result.label} ${(result.confidence * 100).toFixed(0)}%`;
  label.setAttribute("aria-label", `Possible dark pattern: ${result.label}`);

  element.insertAdjacentElement("afterend", label);
}

function clearHighlights() {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((element) => {
    element.classList.remove(HIGHLIGHT_CLASS);
    delete element.dataset.darkPatternClass;
    delete element.dataset.darkPatternConfidence;
  });

  document.querySelectorAll(`.${LABEL_CLASS}`).forEach((label) => label.remove());
}

function createEmptyCounts() {
  return {
    urgency: 0,
    scarcity: 0,
    confirmshaming: 0,
    forced_action: 0,
    hidden_costs: 0,
    misleading_cta: 0
  };
}

async function scanPage() {
  clearHighlights();
  injectHighlightStyles();
  await window.DarkPatternClassifier.loadModel();

  const candidates = collectCandidateElements();
  const summary = {
    totalScanned: candidates.length,
    suspiciousCount: 0,
    countsByClass: createEmptyCounts(),
    threshold: DARK_PATTERN_CONFIG.suspiciousConfidenceThreshold
  };

  for (const candidate of candidates) {
    const result = await window.DarkPatternClassifier.classifyText(candidate.text);
    const isSuspicious =
      result.label !== "safe" &&
      result.confidence >= DARK_PATTERN_CONFIG.suspiciousConfidenceThreshold;

    if (isSuspicious) {
      summary.suspiciousCount += 1;
      summary.countsByClass[result.label] = (summary.countsByClass[result.label] || 0) + 1;
      highlightElement(candidate.element, result);
    }
  }

  return summary;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SCAN_PAGE") {
    scanPage()
      .then((summary) => sendResponse({ ok: true, summary }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === "CLEAR_HIGHLIGHTS") {
    clearHighlights();
    sendResponse({ ok: true });
  }

  return false;
});
