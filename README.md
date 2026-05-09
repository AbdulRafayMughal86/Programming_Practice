# Local Dark Pattern Scanner

Local Dark Pattern Scanner is a Chrome Manifest V3 proof-of-concept extension for detecting webpage text that looks like a possible dark pattern. It scans visible page text, classifies chunks with a local TF-IDF + Logistic Regression model, highlights suspicious elements, and summarizes results in the popup.

This is a university-project-friendly demo. The bundled model is intentionally small and should not be treated as a production-quality detector.

## Folder tree

```text
.
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── contentScript.js
├── classifier.js
├── model/
│   └── model.json
├── training/
│   ├── data.csv
│   └── train_model.py
└── README.md
```

## Privacy and local-only design

The extension is designed to keep webpage data local:

- No external API calls.
- No remote model loading.
- No CDN scripts or remote CSS.
- No analytics, tracking, or server backend.
- The only model load is `model/model.json` through `chrome.runtime.getURL()`.
- Page text is processed in memory by the content script and is not stored permanently.

## How to install in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked**.
4. Select this extension folder.
5. Pin the extension if you want quick access to the popup.

## How to test it

1. Load the extension using the steps above.
2. Open any normal webpage, or create a local HTML page with example phrases such as:
   - `Offer ends soon`
   - `Only 2 left`
   - `No thanks, I hate saving money`
   - `You must subscribe to continue`
   - `Extra fee added at checkout`
   - `Accept all`
3. Click the extension icon.
4. Click **Scan Page**.
5. Suspicious text elements should receive an orange outline and a small label containing the predicted class and confidence score.
6. Click **Clear Highlights** to remove labels and outlines.

## How local ML inference works

The classifier uses a simple local TF-IDF + Logistic Regression pipeline:

1. `contentScript.js` collects visible text from elements such as headings, paragraphs, spans, buttons, links, labels, divs, and list items.
2. Duplicate, invisible, empty, tiny, and overly long chunks are filtered out.
3. `classifier.js` normalizes each text chunk to lowercase, collapses whitespace, and tokenizes words.
4. Tokens found in the local vocabulary are converted into TF-IDF features using IDF values from `model/model.json`.
5. The Logistic Regression weights and bias values are applied to produce class logits.
6. Softmax converts logits into probabilities.
7. If the predicted label is not `safe` and the confidence is greater than the configurable threshold in `contentScript.js`, the element is highlighted.

The threshold is defined in `DARK_PATTERN_CONFIG.suspiciousConfidenceThreshold` in `contentScript.js`.

## Model format

`model/model.json` contains:

- `labels`: class names such as `safe`, `urgency`, and `hidden_costs`.
- `vocabulary`: words used as TF-IDF features.
- `idf`: inverse document frequency values aligned with the vocabulary.
- `weights`: one Logistic Regression weight vector per class.
- `bias`: one bias value per class.
- `preprocessing`: tokenizer and normalization settings.

The bundled `model/model.json` is a small hand-authored demo model with fake but working weights. It demonstrates the full local inference flow immediately after loading the extension.

## How to retrain the model

A small training workflow is included for replacing the demo model with a trained model.

1. Edit `training/data.csv` and add rows with two columns:
   - `text`
   - `label`
2. Use one of these labels:
   - `safe`
   - `urgency`
   - `scarcity`
   - `confirmshaming`
   - `forced_action`
   - `hidden_costs`
   - `misleading_cta`
3. Install Python dependencies:

   ```bash
   python -m pip install scikit-learn pandas
   ```

4. Run the trainer from the extension root:

   ```bash
   python training/train_model.py
   ```

5. The script writes a replacement `model/model.json` that matches the format expected by `classifier.js`.
6. Reload the unpacked extension in `chrome://extensions`.

## Limitations of the demo model

- The bundled model is tiny and intentionally simple.
- It relies mostly on keywords, so it can miss subtle dark patterns.
- It does not understand full page context, intent, legal requirements, or user expectations.
- It does not inspect visual hierarchy beyond the text-bearing DOM element that is highlighted.
- It does not analyze screenshots or image-based text.
- `misleading_cta` is especially context-dependent; words like `Continue` can be harmless on many pages.

## Future improvements

- Better dataset with many real-world labeled examples.
- DOM layout features such as modal detection and element position.
- Visual hierarchy detection, including color, size, and contrast.
- OCR/CV model for image-based dark patterns.
- ONNX or TensorFlow.js support for stronger local models.
