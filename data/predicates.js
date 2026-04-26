// Boolean / categorical state predicates that get established by test answers
// and gate which future tests are feasible. Three-valued: a fact is true, false,
// or unknown (absent from the facts map). Tests are only blocked by an EXPLICIT
// contradiction — unknowns are allowed so the engine can still queue up the
// prerequisite test that would establish the missing fact.
//
// Predicate vocabulary:
//   spinsUp         — spindle reaches operating RPM
//   idsToHost       — drive enumerates on BIOS / OS (implies spinsUp)
//   seeksHeads      — actuator moves heads after spin-up (implies spinsUp)
//   isExternal      — drive is inside a USB-SATA enclosure
//   pcbAttached     — PCB is mounted to the HDA
//   cloneAvailable  — a usable clone (or partial map) exists for further analysis
//   driveTech       — 'cmr' | 'smr' | 'sshd' | 'helium' | 'counterfeit'
//   healthSignal    — accumulated wellness: 'positive' | 'concerning' | 'broken'
//                     (worst-wins aggregation; lets the engine declare a
//                     'healthy drive' outcome only when no concerning signal
//                     has been observed)

export const PREDICATE_KIND = {
  spinsUp: "bool",
  idsToHost: "bool",
  seeksHeads: "bool",
  isExternal: "bool",
  pcbAttached: "bool",
  cloneAvailable: "bool",
  driveTech: "enum",
  healthSignal: "rank",
};

// Forward implications. Whenever the LHS holds, the RHS facts are forced too.
// Applied to a fixed point after every merge.
export const IMPLICATIONS = [
  { when: { idsToHost: true }, then: { spinsUp: true } },
  { when: { seeksHeads: true }, then: { spinsUp: true } },
  { when: { spinsUp: false }, then: { idsToHost: false, seeksHeads: false } },
];

const HEALTH_RANK = { positive: 1, concerning: 2, broken: 3 };

export const PREDICATE_LABELS = {
  spinsUp: "spins up",
  idsToHost: "IDs to host",
  seeksHeads: "heads seek",
  isExternal: "external enclosure",
  pcbAttached: "PCB attached",
  cloneAvailable: "clone available",
  driveTech: "drive tech",
  healthSignal: "wellness",
};

export function mergeEstablishes(facts, establishes) {
  if (!establishes) return facts;
  const next = { ...facts };
  for (const [k, v] of Object.entries(establishes)) {
    if (PREDICATE_KIND[k] === "rank" && next[k] != null) {
      if ((HEALTH_RANK[v] ?? 0) > (HEALTH_RANK[next[k]] ?? 0)) next[k] = v;
    } else {
      next[k] = v;
    }
  }
  // Fixed-point implication chase.
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of IMPLICATIONS) {
      const fires = Object.entries(rule.when).every(
        ([key, val]) => next[key] === val,
      );
      if (!fires) continue;
      for (const [key, val] of Object.entries(rule.then)) {
        if (next[key] !== val) {
          next[key] = val;
          changed = true;
        }
      }
    }
  }
  return next;
}

// A test is feasible unless its `requires` map names a predicate whose
// CURRENT value contradicts the requirement. Unknown predicates are allowed.
export function requirementsMet(test, facts) {
  if (!test.requires) return true;
  for (const [key, val] of Object.entries(test.requires)) {
    const known = facts[key];
    if (known === undefined) continue;
    if (known !== val) return false;
  }
  return true;
}

// Outcome state for the UI. Drives the post-questioning view:
//   investigating  — multiple causes possible, more tests will refine
//   narrowed       — multiple causes remain but no test differentiates them
//   unique         — exactly one cause remains
//   healthy        — drive passes the major hardware checks with no concerning
//                    signals; any leftover hypotheses are filesystem- or
//                    host-side, not the drive itself
//   contradictory  — every cause eliminated but signals indicate a real problem
export function deriveOutcome({ remaining, hasNextTest, facts }) {
  const sig = facts.healthSignal;
  // Drive hardware looks structurally fine: it spins, the host sees it, the
  // heads move, and nothing has flagged a concerning or broken signal.
  const hardwareHealthy =
    facts.spinsUp === true &&
    facts.idsToHost === true &&
    facts.seeksHeads === true &&
    sig === "positive";

  if (remaining.length === 1) return "unique";
  if (remaining.length === 0) {
    if (sig === "broken" || sig === "concerning") return "contradictory";
    return sig === "positive" ? "healthy" : "contradictory";
  }
  // With multiple hypotheses still alive: declare healthy only once no further
  // hardware-level test will help. Until then, keep investigating.
  if (!hasNextTest && hardwareHealthy) return "healthy";
  if (!hasNextTest) return "narrowed";
  return "investigating";
}
