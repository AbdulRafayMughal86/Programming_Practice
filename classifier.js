/*
 * Local TF-IDF + Logistic Regression classifier.
 *
 * This file intentionally uses only browser APIs and local extension files.
 * The only fetch call loads model/model.json through chrome.runtime.getURL().
 */
(function attachClassifier(globalScope) {
  let cachedModel = null;
  let cachedModelPromise = null;

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(text, preprocessing) {
    const normalized = normalizeText(text);
    const minTokenLength = preprocessing?.minTokenLength || 2;
    const tokenPattern = /[a-z0-9']+/g;
    const tokens = normalized.match(tokenPattern) || [];

    return tokens.filter((token) => token.length >= minTokenLength);
  }

  async function loadModel() {
    if (cachedModel) {
      return cachedModel;
    }

    if (!cachedModelPromise) {
      const modelUrl = chrome.runtime.getURL("model/model.json");

      cachedModelPromise = fetch(modelUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Could not load local model: ${response.status}`);
          }
          return response.json();
        })
        .then((model) => {
          validateModel(model);
          cachedModel = model;
          return cachedModel;
        });
    }

    return cachedModelPromise;
  }

  function validateModel(model) {
    const requiredFields = ["labels", "vocabulary", "idf", "weights", "bias", "preprocessing"];
    for (const field of requiredFields) {
      if (!(field in model)) {
        throw new Error(`Model is missing required field: ${field}`);
      }
    }

    if (model.labels.length !== model.weights.length || model.labels.length !== model.bias.length) {
      throw new Error("Model labels, weights, and bias lengths do not match.");
    }
  }

  function buildTfidfVector(tokens, model) {
    const vector = new Array(model.vocabulary.length).fill(0);
    const counts = new Map();

    for (const token of tokens) {
      const index = model.vocabulary.indexOf(token);
      if (index !== -1) {
        counts.set(index, (counts.get(index) || 0) + 1);
      }
    }

    if (counts.size === 0) {
      return vector;
    }

    for (const [index, count] of counts.entries()) {
      // Match scikit-learn TfidfVectorizer(norm=None): raw term count * IDF.
      vector[index] = count * model.idf[index];
    }

    return vector;
  }

  function dotProduct(left, right) {
    let total = 0;
    for (let index = 0; index < left.length; index += 1) {
      total += left[index] * right[index];
    }
    return total;
  }

  function softmax(logits) {
    const maxLogit = Math.max(...logits);
    const exps = logits.map((logit) => Math.exp(logit - maxLogit));
    const sum = exps.reduce((total, value) => total + value, 0);
    return exps.map((value) => value / sum);
  }

  async function classifyText(text) {
    const model = await loadModel();
    const tokens = tokenize(text, model.preprocessing);
    const features = buildTfidfVector(tokens, model);

    const logits = model.weights.map((classWeights, classIndex) => {
      return dotProduct(features, classWeights) + model.bias[classIndex];
    });

    const probabilities = softmax(logits);
    let bestIndex = 0;

    for (let index = 1; index < probabilities.length; index += 1) {
      if (probabilities[index] > probabilities[bestIndex]) {
        bestIndex = index;
      }
    }

    return {
      label: model.labels[bestIndex],
      confidence: probabilities[bestIndex],
      probabilities: Object.fromEntries(
        model.labels.map((label, index) => [label, probabilities[index]])
      )
    };
  }

  async function classifyBatch(texts) {
    return Promise.all(texts.map((text) => classifyText(text)));
  }

  globalScope.DarkPatternClassifier = {
    loadModel,
    classifyText,
    classifyBatch
  };
})(globalThis);
