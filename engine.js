import { hypotheses, hypothesisById } from "./data/hypotheses.js";
import { tests, testById } from "./data/tests.js";
import { actions } from "./data/actions.js";
import { warnings, warningPredicates } from "./data/warnings.js";

// Risk multiplier — higher risk tests get penalised when the remaining
// hypothesis set already contains mechanical failures.
const RISK_PENALTY = { none: 1.0, low: 1.0, medium: 0.7, high: 0.35 };

// Phase filters. Customer mode hides lab-only content because it's not actionable.
function visibleHypotheses(mode) {
  return hypotheses.filter((h) => mode === "technician" || h.phase !== "lab");
}
function visibleTests(mode) {
  return tests.filter((t) => mode === "technician" || t.phase !== "lab");
}

export function createState(mode = "technician") {
  return {
    mode,
    history: [], // [{ testId, answerId }]
    eliminated: new Set(),
  };
}

// Recompute eliminated set from history. Cheap, idempotent, lets us go backward
// by simply popping history and recomputing.
export function recompute(state) {
  const eliminated = new Set();
  for (const { testId, answerId } of state.history) {
    const test = testById[testId];
    if (!test) continue;
    const answer = test.answers.find((a) => a.id === answerId);
    if (!answer) continue;
    for (const h of answer.eliminates) eliminated.add(h);
  }
  state.eliminated = eliminated;
  return state;
}

export function remainingHypotheses(state) {
  return visibleHypotheses(state.mode).filter(
    (h) => !state.eliminated.has(h.id),
  );
}

export function answerTest(state, testId, answerId) {
  state.history.push({ testId, answerId });
  return recompute(state);
}

export function goBack(state) {
  state.history.pop();
  return recompute(state);
}

export function reset(state) {
  state.history = [];
  state.eliminated = new Set();
  return state;
}

// --- Information gain scoring ----------------------------------------------
// For each candidate test, simulate what the remaining set would look like
// after each possible answer. The best test maximises expected reduction
// (we use a simple split-evenness metric rather than full Shannon entropy
// because it's more intuitive to explain in the UI: "this splits 8 down to ~4").
function scoreTest(test, remaining) {
  const remainingIds = new Set(remaining.map((h) => h.id));
  const totalsAfter = test.answers.map((answer) => {
    let count = 0;
    for (const id of remainingIds) if (!answer.eliminates.includes(id)) count++;
    return count;
  });
  if (totalsAfter.length === 0) return { score: 0, totalsAfter };

  // Reward smaller worst-case AND smaller average.
  const worst = Math.max(...totalsAfter);
  const avg = totalsAfter.reduce((a, b) => a + b, 0) / totalsAfter.length;
  const before = remaining.length;

  // Reduction from worst-case answer + average reduction, normalised.
  const worstReduction = (before - worst) / before;
  const avgReduction = (before - avg) / before;
  const raw = worstReduction * 0.4 + avgReduction * 0.6;

  return { score: raw, totalsAfter, worst, avg, before };
}

export function bestNextTest(state) {
  const remaining = remainingHypotheses(state);
  if (remaining.length <= 1) return null;

  const askedTestIds = new Set(state.history.map((h) => h.testId));
  const candidates = visibleTests(state.mode).filter(
    (t) => !askedTestIds.has(t.id),
  );

  // Apply risk penalty: if mechanical failure is suspected, deprioritise risky tests.
  const mechanicalSuspected = remaining.some((h) =>
    ["head_crash", "head_degradation", "stiction_seized_motor"].includes(h.id),
  );

  let best = null;
  for (const test of candidates) {
    const s = scoreTest(test, remaining);
    let score = s.score;
    if (mechanicalSuspected) score *= RISK_PENALTY[test.risk] ?? 1;
    // Skip tests that don't differentiate any remaining hypothesis.
    if (s.totalsAfter.every((t) => t === remaining.length)) continue;
    if (!best || score > best.score) best = { test, score, breakdown: s };
  }
  return best;
}

// --- Recommended actions ---------------------------------------------------
// An action is fully-recommended when every remaining hypothesis is covered by
// its triggers. Otherwise, partial coverage is reported with a percentage so
// the UI can surface "likely" recommendations during messy real-world paths.
export function recommendedActions(state) {
  const remaining = remainingHypotheses(state);
  if (remaining.length === 0) return [];
  const remainingIds = new Set(remaining.map((h) => h.id));

  const scored = actions
    .map((a) => {
      const triggerSet = new Set(a.triggers);
      let covered = 0;
      for (const id of remainingIds) if (triggerSet.has(id)) covered++;
      return { action: a, covered, coverage: covered / remainingIds.size };
    })
    .filter((s) => s.covered > 0)
    .sort((a, b) => b.coverage - a.coverage || b.covered - a.covered);

  return scored.map((s) => ({
    ...s.action,
    coverage: s.coverage,
    confident: s.coverage === 1,
  }));
}

// --- Active warnings -------------------------------------------------------
export function activeWarnings(state) {
  const remaining = remainingHypotheses(state).map((h) => h.id);
  return warnings.filter((w) => {
    const pred = warningPredicates[w.triggerWhen];
    return pred ? pred({ remaining, history: state.history }) : false;
  });
}

// --- Display helpers -------------------------------------------------------
export function getTest(testId) {
  return testById[testId];
}
export function getHypothesis(id) {
  return hypothesisById[id];
}
export function allHypotheses(state) {
  return visibleHypotheses(state.mode);
}

export function historyCards(state) {
  return state.history.map(({ testId, answerId }) => {
    const test = testById[testId];
    const answer = test?.answers.find((a) => a.id === answerId);
    return { test, answer };
  });
}
