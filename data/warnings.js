// Standing warnings — the equivalent of the orange callout boxes in the
// original flowchart. Surfaced contextually based on remaining hypotheses
// or recent answers.
export const warnings = [
  {
    id: "no_freezer",
    title: "Do not use freezer / hammer / DIY tricks",
    body: "Outside-the-box techniques (freezing the drive, tapping it, swapping platters in your kitchen) are far more likely to destroy data than recover it. Only consider them after the customer has explicitly declined professional recovery, in writing.",
    triggerWhen: "always",
  },
  {
    id: "mechanical_power_off",
    title: "Stop powering the drive on",
    body: "If clicking, beeping, or grinding is suspected, every spin-up cycle risks finishing the heads or scoring the platter. Image once, with care, or send it to a lab.",
    triggerWhen: "mechanicalSuspected",
  },
  {
    id: "clone_first",
    title: "Clone before you scan",
    body: "Filesystem recovery tools rescan the disk repeatedly. A weak drive will not survive that. Clone with ddrescue first, scan the clone.",
    triggerWhen: "cloningRelevant",
  },
];

// Predicate functions matching the triggerWhen strings above.
// State here is { remaining, history } from the engine.
export const warningPredicates = {
  always: () => true,
  mechanicalSuspected: ({ remaining }) =>
    remaining.some((h) =>
      ["head_crash", "head_degradation", "stiction_seized_motor"].includes(h),
    ),
  cloningRelevant: ({ remaining }) =>
    remaining.some((h) =>
      ["bad_sectors_minor", "bad_sectors_major", "logical_corruption"].includes(
        h,
      ),
    ),
};
