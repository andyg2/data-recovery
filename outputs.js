// Per-step command-output store. Keyed by `${testId}::${stepIdx}` so a single
// procedure can have multiple captured outputs. Persisted to localStorage so a
// case file survives reloads.
//
// Shape: { "smart::0": { rawText, savedAt } , ... }

const STORAGE_KEY = "hdd-triage-outputs-v1";

let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

function key(testId, stepIdx) {
  return `${testId}::${stepIdx}`;
}

export function getOutput(testId, stepIdx) {
  return load()[key(testId, stepIdx)] || null;
}

export function setOutput(testId, stepIdx, rawText) {
  load();
  cache[key(testId, stepIdx)] = {
    rawText,
    savedAt: new Date().toISOString(),
  };
  save();
}

export function clearOutput(testId, stepIdx) {
  load();
  delete cache[key(testId, stepIdx)];
  save();
}

export function clearAllOutputs() {
  cache = {};
  save();
}

export function allOutputs() {
  return { ...load() };
}
