// Full DIY repair playbooks. Each one is referenced from data/actions.js
// via the `playbook` field. The UI renders these in an overlay when the
// recommended action has a playbook attached.
//
// Schema:
//   id            - matches the playbook reference on an action
//   name
//   when_used     - which failure mode(s) this remediates
//   difficulty    - easy | moderate | hard | expert
//   time_estimate
//   environment   - normal-bench | dust-mitigated | cleanroom-equivalent
//   risk_to_data  - low | medium | high | destructive
//   parts         - [{ name, source, cost_usd, matching }]
//   tools         - [{ name, cost_usd, alternative }]
//   steps         - [{ label, detail, risk }]
//   abort_signals - strings: when to stop and escalate
//   success_rate  - rough percentage range when done correctly

export const repairProcedures = {
  pcb_swap_with_rom_transfer: {
    id: "pcb_swap_with_rom_transfer",
    name: "PCB swap with ROM/NVRAM transfer",
    when_used:
      "Burnt PCB after surge, shorted TVS that doesn't clear by removal alone, scorched motor controller, no spin + no PCB activity, drive-not-detected with visible PCB damage.",
    difficulty: "moderate",
    time_estimate: "1-3 hours",
    environment: "normal-bench",
    risk_to_data: "high",
    parts: [
      {
        name: "Donor PCB - matched to patient",
        source:
          "donordrives.com (matched-and-shipped), hddzone.com, eBay (verify both-sides photos)",
        cost_usd: "60-120 (verified) / 15-40 (eBay)",
        matching:
          "Exact PCB part number printed on the board (e.g. WD '2060-771xxx-xxx REV P1') AND main MCU marking. Same family/firmware ideally.",
      },
      {
        name: "Replacement 25-series SPI flash (only if original ROM is destroyed)",
        source: "Digi-Key / Mouser / LCSC",
        cost_usd: "1-2",
        matching: "Same package and capacity as original ROM chip.",
      },
    ],
    tools: [
      {
        name: "CH341A programmer (black v1.7 with 1.8V mod or use level shifter)",
        cost_usd: "8-15",
        alternative: "Raspberry Pi with flashrom (free if you have one)",
      },
      {
        name: "SOIC-8 test clip",
        cost_usd: "6-30",
        alternative: "Pomona 5250 ($30) or generic ($6)",
      },
      { name: "Torx T6/T8 driver set", cost_usd: "10-30", alternative: "" },
      {
        name: "Hot air rework station (only if chip-off needed)",
        cost_usd: "80-130",
        alternative: "Butane iron + flux ($15)",
      },
      { name: "Multimeter with continuity beep", cost_usd: "20", alternative: "" },
      { name: "Flux pen + 0.5mm leaded solder", cost_usd: "15", alternative: "" },
    ],
    steps: [
      {
        label: "Photograph the original PCB",
        detail:
          "Both sides, all chip markings legible, including the 8-pin ROM and motor controller. You'll need these for matching.",
        risk: "low",
      },
      {
        label: "Verify donor match",
        detail:
          "Compare full PCB part number including revision suffix. Mismatched revision often means different preamp drive strength.",
        risk: "medium",
      },
      {
        label: "ESD ground yourself",
        detail:
          "Wrist strap to mains earth or ESD mat. Do not work on carpet.",
        risk: "low",
      },
      {
        label: "Remove the original PCB",
        detail:
          "T6 or T8 screws (typically 4-6). Lift straight up to clear the spring-loaded head-stack and motor contacts without bending them.",
        risk: "medium",
      },
      {
        label: "Read original ROM 3 times",
        detail:
          "Clip CH341A onto the 8-pin SPI flash on the original PCB (no need to power the drive). In NeoProgrammer or asprogrammer auto-detect (usually 25xx series). Read 3 times; verify all dumps are byte-identical. Save as patient_rom.bin.",
        risk: "medium",
      },
      {
        label: "Read donor ROM as backup",
        detail:
          "Same procedure on donor PCB. Save as donor_original.bin for rollback.",
        risk: "low",
      },
      {
        label: "Write patient ROM to donor",
        detail:
          "Erase donor flash, write patient_rom.bin, verify. Do NOT skip the verify pass.",
        risk: "high",
      },
      {
        label: "Inspect donor contacts",
        detail:
          "Clean head-stack and motor contact pads on the donor PCB with isopropyl 99% and a lint-free swab. Oxidation here causes click-of-death post-swap.",
        risk: "low",
      },
      {
        label: "Mount donor PCB on patient",
        detail:
          "Align over standoffs, hand-tighten screws in a cross pattern. Do not overtighten - cracks the contact pads.",
        risk: "medium",
      },
      {
        label: "Power up briefly",
        detail:
          "SATA + power for 10 seconds, listen. Healthy: spin-up, single soft seek, then idle. Abnormal: clicking, no spin, repeated spin-down.",
        risk: "medium",
      },
      {
        label: "Image immediately",
        detail:
          "If detected, run ddrescue with --no-scrape first pass to a target drive 1.2x the size. Do not browse the filesystem.",
        risk: "low",
      },
    ],
    abort_signals: [
      "Smoke or smell on power-up.",
      "Donor ROM chip is a different package or capacity.",
      "PCB has visible burn-through to inner layers.",
      "Clicking persists after correct ROM transfer (head damage, not PCB - swap won't help).",
    ],
    success_rate:
      "70-85% when PCB number matches exactly and ROM transfers cleanly. Drops to ~30% with mismatched revision. Near 0% if the underlying fault was misdiagnosed head damage.",
  },

  tvs_diode_diagnosis_and_replacement: {
    id: "tvs_diode_diagnosis_and_replacement",
    name: "TVS diode diagnosis and removal/replacement",
    when_used:
      "Drive completely dead after power surge, wrong PSU polarity, or laptop charger swap. PCB looks intact but no spin and no detection.",
    difficulty: "easy",
    time_estimate: "20-45 minutes",
    environment: "normal-bench",
    risk_to_data: "low",
    parts: [
      {
        name: "SMBJ5.0A (5V rail TVS) - SMB package",
        source: "Digi-Key / Mouser / LCSC",
        cost_usd: "0.50",
        matching: "Optional - drive will run without it (sacrificial protection).",
      },
      {
        name: "SMBJ12A (12V rail TVS) - SMB package",
        source: "Digi-Key / Mouser / LCSC",
        cost_usd: "0.50",
        matching: "Optional - same as above.",
      },
    ],
    tools: [
      { name: "Multimeter with diode/continuity mode", cost_usd: "20", alternative: "" },
      {
        name: "Fine-tip soldering iron or hot air at 350C",
        cost_usd: "15-80",
        alternative: "USB-powered iron acceptable for SMB removal",
      },
      { name: "Tweezers (ESD-safe)", cost_usd: "5", alternative: "" },
    ],
    steps: [
      {
        label: "Remove PCB from drive",
        detail: "T6/T8 screws, lift straight up.",
        risk: "low",
      },
      {
        label: "Locate TVS diodes",
        detail:
          "Small black SMB-package components near the SATA power connector, usually marked with a polarity stripe. There are typically two: one on 5V, one on 12V.",
        risk: "low",
      },
      {
        label: "Test in continuity mode",
        detail:
          "Probe across each TVS. A shorted diode beeps / reads <5 ohms - that is the failed one. A healthy TVS reads open in both directions at the multimeter's test voltage.",
        risk: "low",
      },
      {
        label: "Identify which rail blew",
        detail:
          "12V TVS shorted = surge through the molex 12V (most common from bad PSU). 5V TVS shorted = USB-bridge backfeed or wrong adapter.",
        risk: "low",
      },
      {
        label: "Remove the shorted TVS",
        detail:
          "Hot air at 350C from underneath; or alternate-tin both pads with a regular iron and rock it off. Do not pry while solder is solid.",
        risk: "medium",
      },
      {
        label: "Test the drive without the TVS",
        detail:
          "Reattach PCB, power up. If it spins and detects, the TVS was the only damage.",
        risk: "medium",
      },
      {
        label: "Image the drive immediately",
        detail:
          "ddrescue full clone before doing anything else. The TVS was your only surge protection and it's now gone.",
        risk: "low",
      },
      {
        label: "Optional - solder replacement TVS",
        detail:
          "After imaging, fit SMBJ5.0A or SMBJ12A in the original orientation (cathode stripe matches silkscreen).",
        risk: "low",
      },
    ],
    abort_signals: [
      "Both TVS diodes test fine but drive still dead (damage is downstream - motor controller IC or MCU).",
      "Visible burn marks past the TVS.",
      "Drive spins but immediately clicks (head damage, separate issue).",
    ],
    success_rate:
      "85-95% when symptom matches (post-surge, dead, shorted TVS confirmed). Near 100% recovery of data once spinning, since platters are untouched.",
  },

  head_stack_assembly_swap: {
    id: "head_stack_assembly_swap",
    name: "Head stack assembly (HSA) transplant",
    when_used:
      "Confirmed head failure - clicking with healthy PCB and good ROM, all-zero reads, drive-not-ready after media test, partial head map (some heads work, some don't).",
    difficulty: "expert",
    time_estimate: "3-8 hours including donor sourcing",
    environment: "cleanroom-equivalent",
    risk_to_data: "destructive",
    parts: [
      {
        name: "Family-matched donor drive",
        source:
          "donordrives.com (~$80-200), hddzone, or buy two identical drives off eBay and treat the cheaper as donor",
        cost_usd: "80-200 (verified) / 30-80 (eBay risk)",
        matching:
          "Same model, same firmware, same site code, ideally same date code +/- 6 months. WD: match DCM code. Seagate: match SN/PN/FW.",
      },
      {
        name: "Head combs / head parking tool - drive-family specific",
        source: "HDDSurgery (professional sets), various Chinese sellers",
        cost_usd: "40-300",
        matching:
          "WD 3.5\" comb fits most modern WDs; Seagate combs are family-specific; 2.5\" combs are different and more fragile.",
      },
    ],
    tools: [
      {
        name: "Laminar flow hood or HEPA filtered enclosure",
        cost_usd: "200-1500",
        alternative:
          "DIY HEPA box (Tier 2 in the Reference > Clean environment guide). NOT a steamy bathroom for HSA work.",
      },
      { name: "Anti-static gloves (powder-free nitrile)", cost_usd: "10", alternative: "" },
      {
        name: "T6/T7/T8 Torx drivers, magnetized",
        cost_usd: "15-50",
        alternative: "Wiha or Wera quality - cheap bits strip the small screws",
      },
      { name: "Bright LED inspection light", cost_usd: "10", alternative: "" },
    ],
    steps: [
      {
        label: "Confirm head failure first",
        detail:
          "Run vendor diagnostic; check SMART for reallocated/pending; attempt head map. Do not open a drive on suspicion alone.",
        risk: "medium",
      },
      {
        label: "Source matched donor and verify",
        detail:
          "Photograph donor label, confirm family match before opening either drive.",
        risk: "low",
      },
      {
        label: "Prepare clean environment",
        detail:
          "Run hood for 15 minutes before opening. Wipe surfaces with IPA. No cardboard, no clothing fibers, hair tied back, mask on.",
        risk: "high",
      },
      {
        label: "Open donor first",
        detail:
          "Remove cover screws (often one hidden under the warranty sticker). Peel cover, do not flex the actuator magnet.",
        risk: "medium",
      },
      {
        label: "Park donor heads on the comb",
        detail:
          "Slide the head comb between the head sliders while gently moving the actuator off the platters. Heads must NEVER touch each other or the platter surface.",
        risk: "high",
      },
      {
        label: "Remove donor HSA",
        detail:
          "Unscrew the voice coil magnet top plate, lift the actuator pivot screw, lift the HSA out as one unit by the comb. Place comb-side-down on a clean surface.",
        risk: "high",
      },
      {
        label: "Repeat on patient",
        detail:
          "Same procedure. The patient's heads may already be crashed - inspect platters under angled light for visible scoring.",
        risk: "high",
      },
      {
        label: "Install donor HSA into patient",
        detail:
          "Lower into pivot, secure pivot screw to spec torque (loose = head misalignment, over-tight = warped baseplate), reinstall magnet plate.",
        risk: "high",
      },
      {
        label: "Withdraw the comb",
        detail:
          "Slide it out smoothly with the heads riding onto the ramp (or onto the inner landing zone for contact-start-stop drives).",
        risk: "high",
      },
      {
        label: "Close cover loosely",
        detail:
          "Two screws diagonally - just dust protection, you're imaging immediately not running long-term.",
        risk: "low",
      },
      {
        label: "Power on outside the hood",
        detail:
          "Listen for healthy spin-up. If it reads, ddrescue immediately to a target drive. Do not power-cycle.",
        risk: "medium",
      },
    ],
    abort_signals: [
      "Helium-sealed drive (laser-welded lid, 'He' or 'Helio' on label) - DIY swap is impossible, helium escapes the moment you breach the seal.",
      "Visible deep circular scoring on platters - media is gone, no swap will recover it.",
      "Donor heads also click after transplant (family mismatch or contamination).",
      "Any audible scrape during spin-up.",
    ],
    success_rate:
      "30-50% DIY in an improvised clean environment. 70-85% in a real cleanroom with PC-3000 to manage the head map. Near 0% on helium drives or visibly scored media.",
  },

  platter_visual_inspection: {
    id: "platter_visual_inspection",
    name: "Platter visual inspection (no swap)",
    when_used:
      "Triage decision - is this drive recoverable at all, or is the media destroyed? Run before committing to an HSA swap or shipping to a lab.",
    difficulty: "moderate",
    time_estimate: "30 minutes",
    environment: "dust-mitigated",
    risk_to_data: "medium",
    parts: [],
    tools: [
      { name: "T6/T8 Torx drivers", cost_usd: "10", alternative: "" },
      {
        name: "Bright white LED flashlight, focusable beam",
        cost_usd: "15",
        alternative: "Phone flashlight at low angle works in a pinch",
      },
      {
        name: "Magnifier or jeweller's loupe 10x",
        cost_usd: "10",
        alternative: "Phone macro mode",
      },
      { name: "Phone camera for documentation", cost_usd: "0", alternative: "" },
    ],
    steps: [
      {
        label: "Decide first",
        detail:
          "Once you open the cover, the drive should be considered single-use without a cleanroom. Do not open if you might still ship to a lab - labs charge more or refuse contaminated drives.",
        risk: "high",
      },
      {
        label: "Find all cover screws",
        detail:
          "Usually 6-9 T8. One is almost always under the warranty/void sticker.",
        risk: "low",
      },
      {
        label: "Lift cover gently",
        detail:
          "The gasket may stick. Pry evenly so you don't snap the cover and shower the platters with debris.",
        risk: "medium",
      },
      {
        label: "Shine light at a low angle across the platter",
        detail:
          "Rotate platter slowly by the spindle hub (clean gloved finger) and watch for: concentric scratches (head crash, often fatal); circular dark rings (worn lubricant, usually still readable); a single deep gouge (catastrophic crash); fine matte haze (head smear - data on that surface is gone).",
        risk: "medium",
      },
      {
        label: "Inspect heads on the ramp",
        detail:
          "Look at the slider tips under magnification. Bent suspensions, missing sliders, or visible debris on the slider face = head failure confirmed.",
        risk: "low",
      },
      {
        label: "Photograph everything",
        detail:
          "Multiple angles, both platters if double-sided, both head sliders. Useful for lab quotes if you escalate.",
        risk: "low",
      },
      {
        label: "Close cover loosely if not proceeding",
        detail:
          "Reinstall cover screws to keep dust out during transit. Mark drive 'OPENED - do not power on'.",
        risk: "low",
      },
    ],
    abort_signals: [
      "Concentric scoring you can feel with a fingernail (do not power on, lab-only).",
      "Platter surface is brown/discoloured (oxidation - data is gone).",
      "Visible debris on platter (powering on will scrape it across every track).",
    ],
    success_rate:
      "Diagnostic only. 95%+ accurate at distinguishing 'head swap viable' from 'media destroyed'.",
  },

  stiction_freeing: {
    id: "stiction_freeing",
    name: "Stiction release",
    when_used:
      "Drive spins up briefly then stops, or makes a faint hum but no rotation, on older drives (pre-2008, especially IBM Deskstar/early Seagate) that have sat unpowered for years. Heads stuck to platters at the landing zone.",
    difficulty: "easy",
    time_estimate: "5-15 minutes",
    environment: "normal-bench",
    risk_to_data: "medium",
    parts: [],
    tools: [
      {
        name: "Bare hands, or a rubber strap wrench for grip",
        cost_usd: "5",
        alternative: "",
      },
    ],
    steps: [
      {
        label: "Confirm stiction symptom",
        detail:
          "Power on, listen for motor attempting and giving up; feel the case for vibration that doesn't develop into spin. Modern drives (post-2008, ramp-load) almost never get stiction - if your drive is newer, the problem is something else and this procedure will damage it.",
        risk: "medium",
      },
      {
        label: "Disconnect power",
        detail: "Don't twist a powered drive.",
        risk: "low",
      },
      {
        label: "Hold drive flat in both hands, label up",
        detail: "Grip firmly along the long edges.",
        risk: "low",
      },
      {
        label: "Sharp rotational twist",
        detail:
          "A quick ~30 degree clockwise-then-counter-clockwise twist in the plane of the platters. The inertia of the platter stack against the stuck heads breaks the stiction bond.",
        risk: "medium",
      },
      {
        label: "Power on immediately",
        detail:
          "If it spins, image the drive without delay. Stiction often recurs on next cold start.",
        risk: "low",
      },
      {
        label: "If still stuck, escalate twist sharpness",
        detail:
          "Up to 2-3 attempts. Do not impact the drive against a surface. Do not drop.",
        risk: "medium",
      },
      {
        label: "After successful spin, do not power-cycle",
        detail:
          "Run ddrescue continuously to a target drive. Every cold start risks re-sticking and possibly head damage.",
        risk: "low",
      },
    ],
    abort_signals: [
      "Drive is a modern ramp-load design (no stiction is possible, you'll only damage it).",
      "Grinding or scraping sound on spin attempt (stiction has already torn the head suspension - lab only).",
      "Drive spins but clicks (separate problem - head fault).",
    ],
    success_rate:
      "60-80% on genuine stiction cases (old contact-start-stop drives). Data behind it is then 95%+ recoverable if imaged immediately.",
  },

  ata_password_unlock: {
    id: "ata_password_unlock",
    name: "ATA security password unlock",
    when_used:
      "Drive is healthy but locked with an ATA password (BIOS-level), often after a stolen-laptop recovery, second-hand purchase, or forgotten password on a self-encrypting feature.",
    difficulty: "moderate",
    time_estimate: "15 minutes to several hours",
    environment: "normal-bench",
    risk_to_data: "destructive",
    parts: [],
    tools: [
      { name: "Linux live USB with hdparm", cost_usd: "0", alternative: "" },
      {
        name: "Desktop with SATA hot-swap capability",
        cost_usd: "0",
        alternative: "Most desktops support this - check BIOS settings",
      },
      {
        name: "Vendor master-password list (manufacturer-published or community-maintained)",
        cost_usd: "0",
        alternative: "",
      },
    ],
    steps: [
      {
        label: "Check current state",
        detail:
          "Boot Linux, run `hdparm -I /dev/sdX` and read the Security section: 'enabled' = locked, 'frozen' = BIOS has frozen the security set, 'locked' = needs password to access data.",
        risk: "low",
      },
      {
        label: "Unfreeze if frozen",
        detail:
          "Suspend-to-RAM (`systemctl suspend`) and wake. On resume the freeze lock often clears. Or hot-plug the SATA data cable after boot (power first, then data) - the drive comes up unfrozen.",
        risk: "low",
      },
      {
        label: "Try the user's known passwords first",
        detail:
          "`hdparm --user-master u --security-unlock 'password' /dev/sdX`. NOTE: most drives lock out after 5 wrong tries until power-cycle, and a few will SECURITY ERASE. Read your specific model's behaviour before guessing.",
        risk: "high",
      },
      {
        label: "Try vendor master password",
        detail:
          "`hdparm --user-master m --security-unlock 'MASTER_PASSWORD' /dev/sdX`. Seagate factory default is often 32 spaces. WD often blank or 'WDCWDCWDCWDC...'. HGST/Hitachi varies. Master only works if user didn't set master capability to 'maximum'.",
        risk: "high",
      },
      {
        label: "Disable security after unlock",
        detail:
          "`hdparm --user-master u --security-disable 'password' /dev/sdX` so it doesn't relock on next power-cycle.",
        risk: "low",
      },
      {
        label: "If laptop-set password, try the laptop",
        detail:
          "HP/Dell/Lenovo laptops sometimes derive the ATA password from the service tag. Boot the original laptop with the drive - password may auto-fill.",
        risk: "low",
      },
      {
        label: "Image immediately after unlock",
        detail:
          "ddrescue clone before any other operation. If security re-engages you've still got the data.",
        risk: "low",
      },
    ],
    abort_signals: [
      "Drive is self-encrypting (SED/Opal) with a forgotten DEK - cryptographic erase on wrong password, no recovery possible.",
      "Firmware indicates 'SECURITY COUNT EXPIRED' - further attempts will erase.",
      "You don't know if the drive is set to 'high' or 'maximum' master mode (maximum + lost user password = data is gone, master only erases).",
    ],
    success_rate:
      "50-70% when password is unknown but drive is consumer-grade with vendor-default master. Near 100% when the user remembers the password and just needs the drive unfrozen. Near 0% on SED/Opal with lost key.",
  },

  hpa_dco_removal: {
    id: "hpa_dco_removal",
    name: "HPA / DCO removal to restore advertised capacity",
    when_used:
      "Drive reports smaller capacity than label, recovered partition table references sectors past the reported end, or a previous owner / OEM recovery partition / rootkit hid sectors via Host Protected Area or Device Configuration Overlay.",
    difficulty: "easy",
    time_estimate: "10-20 minutes",
    environment: "normal-bench",
    risk_to_data: "medium",
    parts: [],
    tools: [
      {
        name: "Linux live USB with hdparm and idle3-tools",
        cost_usd: "0",
        alternative: "",
      },
      {
        name: "Vendor utility (HGST Feature Tool, Seagate SeaTools for DOS)",
        cost_usd: "0",
        alternative: "",
      },
    ],
    steps: [
      {
        label: "Check native vs reported size",
        detail:
          "`hdparm -N /dev/sdX` shows `max sectors = X/Y` where X is current visible, Y is native. If X < Y you have an HPA.",
        risk: "low",
      },
      {
        label: "Check for DCO",
        detail:
          "`hdparm --dco-identify /dev/sdX` reveals the device's true factory configuration. If it differs from `hdparm -I` output, a DCO is in place.",
        risk: "low",
      },
      {
        label: "Image first, modify second",
        detail:
          "ddrescue clone the visible portion to a target drive before changing anything. If HPA removal goes wrong you still have what you started with.",
        risk: "low",
      },
      {
        label: "Remove HPA temporarily",
        detail:
          "`hdparm -N pYYYYYYYYY /dev/sdX` where Y is the native max sectors value. Lowercase `p` makes the change non-volatile. Omit p for one-shot until power-cycle. Try volatile first.",
        risk: "medium",
      },
      {
        label: "Power-cycle and re-check",
        detail:
          "After volatile change confirms the drive comes up at full size with no errors, repeat with `p` to make permanent if desired.",
        risk: "low",
      },
      {
        label: "Restore DCO",
        detail:
          "`hdparm --dco-restore /dev/sdX` reverts to factory geometry. Some drives require `--yes-i-know-what-i-am-doing`.",
        risk: "medium",
      },
      {
        label: "For WD drives that ignore hdparm",
        detail:
          "Use idle3-tools or wdidle3. Some WD firmware exposes capacity differently and needs vendor commands.",
        risk: "medium",
      },
      {
        label: "Re-image the now-larger drive",
        detail:
          "ddrescue the full native size to a fresh target. The previously hidden sectors may contain the OEM recovery image, deleted partitions, or evidence.",
        risk: "low",
      },
    ],
    abort_signals: [
      "`hdparm -N` returns 'bad/missing sense data' (drive doesn't support the command set, try vendor tool).",
      "The drive's native max according to DCO is smaller than label (DCO has been used to permanently shrink - factory-only reverse).",
      "SMART errors appear immediately after HPA removal (the hidden area may have been hiding reallocated sectors).",
    ],
    success_rate:
      "90%+ on drives that support HOST_PROTECTED_AREA feature set (essentially all post-2002 ATA drives). Recovered hidden data is then readable at the same rate as the rest of the drive.",
  },
};
