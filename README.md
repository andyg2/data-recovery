# Hard Drive Recovery Decision Engine

A browser-based diagnostic and repair guide for failing hard disk drives. Walks you through targeted tests, narrows down what's actually wrong, and tells you what to do about it - including which parts to buy and what kind of clean environment you need to do the work yourself.

**Demo:** https://dgte.pro/data-recovery/

**Repo:** https://github.com/andyg2/data-recovery

## What it does

You answer questions about how the drive is behaving (sounds, BIOS detection, SMART output, what shows up in a hex dump, etc.). The engine tracks 42 distinct failure modes and rules them out as your answers come in. Once the candidate set narrows, it surfaces concrete next actions - from "shuck the enclosure and connect direct to SATA" through to detailed playbooks for PCB swaps, head-stack transplants, parking-ramp swaps, and donor magnet swaps.

The philosophy is to keep cases out of the lab pathway when realistic. Most "my external drive died" cases are dead USB bridges with healthy drives inside. Most "BIOS doesn't see the drive" cases on old machines are 28-bit LBA limits or 2.2 TB MBR caps. Most "I can't open my files" cases are forgotten BitLocker passwords whose recovery key is sitting in the user's Microsoft account. The tool routes you to the cheap fix first, and only escalates to lab-tier work when the symptoms genuinely call for it.

## Coverage

- **42 failure hypotheses** across electronic, firmware, mechanical, environmental, and interface domains
- **30 diagnostic tests** with phased risk weighting (the engine deprioritises high-risk tests when mechanical failure is suspected)
- **37 recommended actions** with severity tagging (DIY / shop / lab / cleanroom / unrecoverable)
- **16 step-by-step repair playbooks** with parts lists, tool lists, abort signals, and realistic success rates
- **30 OS-specific procedures** (Windows / Linux / macOS commands) with copy-to-clipboard support and per-step output capture

Failure modes covered include: PCB failure, TVS diode shorts, ROM/NVRAM corruption, firmware SA corruption, translator/P-list corruption, head crashes, head degradation, partial head failure, parking-ramp damage, magnet damage, voice-coil flex damage, stiction, helium leaks, ATA password locks, HPA/DCO misconfiguration, USB-bridge failures, encrypted-bridge key loss, host-side encryption (BitLocker / FileVault / LUKS), capacity barriers, SMR/SSHD-specific issues, counterfeit drives, SED key loss, thermal-window failures, and more.

## Modes

- **Customer / Shop triage** - the drive is on the bench, you're trying to figure out what to do with it. Hides lab-only content. Risk-weighted test ordering avoids spinning up a clicking drive any more than necessary.
- **Technician** - the full hypothesis space, including lab-phase tests that need PC-3000-class tooling.

## Features

- **Pure static site** - ES modules, no build step. Open `index.html` and it runs.
- **localStorage persistence** for drive specifics (DEVICE, MODEL, SERIAL, CLONE_DEST, etc.), OS choice, and captured command outputs across reloads.
- **Auto-parse detection output** - paste raw `Get-PhysicalDisk`, `lsblk`, `diskutil list`, or `smartctl` output and the tool extracts the fields and offers them for variable assignment.
- **Per-step output capture** - paste a command's output back into the UI to confirm you ran it and surface findings.
- **Live information-gain scoring** - the engine picks the next test that maximises hypothesis reduction, with risk penalties applied when mechanical failure is suspected.
- **Reference content** - clean-environment tiers (bathroom-steam through laminar-flow cabinet), parts sourcing notes, donor-matching strictness rules, and a starter toolkit.

## Run locally

```bash
git clone https://github.com/andyg2/data-recovery.git
cd data-recovery
# Any static server works:
python -m http.server 8080
# or
npx serve
```

Then open http://localhost:8080

## Project structure

```
index.html              UI shell, styles, layout
engine.js               Hypothesis tracking, test scoring, action recommendation
ui.js                   Renderer, event handlers, drawer/overlay logic
drive.js                Drive specifics store + OS hints
drive-parsers.js        Parsers for Windows/Linux/macOS detection commands
outputs.js              Per-step captured-output store
data/
  hypotheses.js           Possible failure modes
  tests.js                Questions, answer choices, hypothesis eliminations
  actions.js              Recommended actions per hypothesis cluster
  procedures.js           OS-specific commands per test
  repair-procedures.js    Step-by-step DIY repair playbooks
  knowledge.js            Reference content (clean env, parts, toolkit)
  warnings.js             Banner-style cautions tied to remaining-set predicates
```

## Disclaimer

Hard drive recovery is a destructive activity when done wrong. This tool gives you the information needed to make informed decisions but does not replace experience or professional judgment. If the data on the drive is irreplaceable and you can afford a professional recovery service, use one - especially for visible mechanical damage, helium drives, or platter contamination. The tool flags these cases and tells you not to DIY them, but the call is always yours.

## License

MIT
