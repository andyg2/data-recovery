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

  external_drive_shuck: {
    id: "external_drive_shuck",
    name: "Shuck an external drive and connect bare to SATA",
    when_used:
      "Any external drive that's not detected, slow, or behaving oddly. The first thing to try - 80% of 'my external died' cases are a dead bridge with a healthy drive inside.",
    difficulty: "easy",
    time_estimate: "10-30 minutes",
    environment: "normal-bench",
    risk_to_data: "low",
    parts: [
      {
        name: "(optional) Replacement enclosure - if you want to rehouse",
        source: "Amazon, AliExpress (Sabrent, ORICO, Inateck)",
        cost_usd: "10-25",
        matching:
          "Match the original drive's interface (SATA 3.5\" or 2.5\"). Avoid encrypted enclosures unless you specifically want encryption again.",
      },
    ],
    tools: [
      {
        name: "Plastic spudgers / thin guitar picks (iFixit Pro Tech kit)",
        cost_usd: "5-25",
        alternative: "An old credit card slid along the seam works in a pinch",
      },
      {
        name: "Phillips #00 / #1 driver",
        cost_usd: "5",
        alternative: "Most enclosures are clip-fit only, no screws",
      },
      {
        name: "Desktop SATA + power, OR a known-good SATA-USB dock",
        cost_usd: "0-30",
        alternative: "",
      },
    ],
    steps: [
      {
        label: "Photograph the enclosure and label",
        detail:
          "Note the model number printed on the bottom of the enclosure (not the drive's own model - the enclosure's). You'll need it if you discover hardware encryption and have to source a same-firmware donor bridge.",
        risk: "low",
      },
      {
        label: "Find the seam and start at one corner",
        detail:
          "Most enclosures have a snap-fit seam running the length of the case. Slide a spudger in at one corner and work it along - clips release with audible clicks.",
        risk: "low",
      },
      {
        label: "Disconnect the drive from the bridge PCB",
        detail:
          "The bridge is a small green PCB with a SATA edge-connector that mates with the drive. Pull straight - do not flex.",
        risk: "low",
      },
      {
        label: "KEEP THE BRIDGE",
        detail:
          "Put it in a labelled bag. WD MyBook/Easystore, Seagate Backup Plus, and many Toshiba enclosures encrypt the drive's contents using a key in the bridge's serial flash. Discarding it = losing the data even if the drive is fine.",
        risk: "high",
      },
      {
        label: "Connect the bare drive to a desktop SATA port",
        detail:
          "Open the case, plug in SATA data + SATA power. Or use a USB3 SATA dock. Boot the host.",
        risk: "low",
      },
      {
        label: "Inspect the data layer",
        detail:
          "If the drive IDs and a hex dump of LBA 0 shows MBR/GPT and filesystem signatures: the bridge was the only failure. Image as normal. If the data is uniform random noise: the bridge was encrypting; you'll need the original bridge or a same-firmware donor to decrypt.",
        risk: "low",
      },
    ],
    abort_signals: [
      "Drive is glued or ultrasonically welded into the enclosure (rare on cheap units, more common on Apple's external Time Capsule HDDs) - prying may damage the drive.",
      "Drive is USB-native (no SATA edge connector visible, soldered directly to the bridge) - you cannot rehouse via SATA.",
      "Bridge has visible burn damage and the drive smells burnt - PCB on the drive itself may also be dead.",
    ],
    success_rate:
      "85-95% restore-to-detection on non-encrypted enclosures. Drops to 30-50% on encrypted enclosures where the original bridge died.",
  },

  encrypted_bridge_key_recovery: {
    id: "encrypted_bridge_key_recovery",
    name: "Encrypted-enclosure bridge flash transplant",
    when_used:
      "Shucked drive reads as uniform random noise, the original USB-SATA bridge is dead or unreliable, and the user wants the data on the platters.",
    difficulty: "moderate",
    time_estimate: "1-3 hours",
    environment: "normal-bench",
    risk_to_data: "medium",
    parts: [
      {
        name: "Same-firmware donor enclosure",
        source:
          "eBay (search by exact USB VID/PID + enclosure model) - WD bridges and Seagate Backup Plus bridges are listed individually too.",
        cost_usd: "20-50",
        matching:
          "USB VID/PID must match (lsusb / Device Manager). For WD specifically, the firmware version (visible in WD Discovery / WD Drive Utilities) must also match - a different rev uses a different key derivation.",
      },
    ],
    tools: [
      {
        name: "CH341A programmer with SOIC-8 clip (already in core toolkit)",
        cost_usd: "8-15",
        alternative: "Raspberry Pi with flashrom",
      },
      {
        name: "Hot air rework station (if chip-off transfer is needed)",
        cost_usd: "80-130",
        alternative: "Fine-tip iron + flux for in-circuit clip read",
      },
      {
        name: "USB protocol analyser (optional, for confirming bridge identity)",
        cost_usd: "20-100",
        alternative: "lsusb -v / USBView is enough for most cases",
      },
    ],
    steps: [
      {
        label: "Confirm the encryption pattern",
        detail:
          "Hex dump the shucked drive's first 16 MB. Uniform high-entropy noise = bridge encryption. If you see normal filesystem structure, the bridge was NOT encrypting and you can stop here.",
        risk: "low",
      },
      {
        label: "Identify the bridge model and firmware",
        detail:
          "Read the chip markings on the bridge PCB. WD enclosures use Initio / JMicron / WD-custom. Seagate uses ASM/Initio. Note the chip part numbers. Plug into a working host briefly (if the bridge spins up) and read VID/PID.",
        risk: "medium",
      },
      {
        label: "Source a same-firmware donor",
        detail:
          "A donor enclosure of the SAME model AND firmware revision. eBay listings often include firmware in the description; if not, ask the seller. A wrong-firmware donor will spin up the drive but fail to decrypt.",
        risk: "medium",
      },
      {
        label: "Read the original bridge's serial flash",
        detail:
          "Locate the 8-pin SOIC SPI flash on the original bridge PCB. Clip the CH341A on (drive does not need to be powered). Read 3 times in NeoProgrammer; verify identical. Save as patient_bridge.bin.",
        risk: "medium",
      },
      {
        label: "Read the donor's flash for backup",
        detail: "Same procedure on the donor. Save as donor_original.bin.",
        risk: "low",
      },
      {
        label: "Write patient flash to donor",
        detail:
          "Erase donor flash, write patient_bridge.bin, verify. The donor bridge now has the patient's encryption key.",
        risk: "high",
      },
      {
        label: "Reassemble: patient drive into donor enclosure with patched bridge",
        detail:
          "Connect the patient SATA drive to the donor's bridge. Plug into a USB host.",
        risk: "medium",
      },
      {
        label: "Image immediately to a target drive",
        detail:
          "Once decrypted-on-the-fly reads succeed, ddrescue to a separate target. Do not rely on the patched donor for long-term storage.",
        risk: "low",
      },
    ],
    abort_signals: [
      "Original bridge flash reads as all-FF or all-00 - the key is gone, no recovery possible.",
      "WD SmartWare 'set a password' was enabled and the password is forgotten - additional layer beyond the device key.",
      "Donor refuses to enumerate the patient drive after flash transfer - firmware mismatch, find a closer donor.",
    ],
    success_rate:
      "60-80% with a same-firmware donor. Near 0% if the original bridge flash was destroyed and no matching donor is findable.",
  },

  encryption_key_recovery: {
    id: "encryption_key_recovery",
    name: "Recover host-side encryption keys",
    when_used:
      "Drive is healthy but every sector is BitLocker, FileVault, LUKS, or similar. User has lost the password / no recovery key handy.",
    difficulty: "easy",
    time_estimate: "15 minutes to several hours of searching",
    environment: "normal-bench",
    risk_to_data: "low",
    parts: [],
    tools: [
      { name: "Linux live USB with cryptsetup, dislocker", cost_usd: "0", alternative: "" },
      { name: "Microsoft account access", cost_usd: "0", alternative: "" },
      { name: "Apple ID / iCloud access", cost_usd: "0", alternative: "" },
    ],
    steps: [
      {
        label: "Identify the encryption layer",
        detail:
          "Hex dump the partition header. '-FVE-FS-' = BitLocker. 'LUKS' = LUKS1/2. 'encrdsa' or APFS-encrypted = FileVault. Random with no header = VeraCrypt or pre-Vista BitLocker.",
        risk: "low",
      },
      {
        label: "BitLocker: check Microsoft account",
        detail:
          "https://account.microsoft.com/devices/recoverykey lists every BitLocker recovery key for every device signed into the account. Windows 11 Home enables Device Encryption automatically and stashes the key here.",
        risk: "low",
      },
      {
        label: "BitLocker: check the AD domain",
        detail:
          "If the device was domain-joined, the recovery key is escrowed in AD. The user's IT admin can retrieve it from Active Directory Users and Computers > BitLocker tab.",
        risk: "low",
      },
      {
        label: "BitLocker: check a printed copy",
        detail:
          "BitLocker setup prompts users to save / print the key. Check email, Drive, Dropbox, OneDrive, and anywhere the user might have stashed a 48-digit numeric string.",
        risk: "low",
      },
      {
        label: "FileVault: check iCloud key escrow",
        detail:
          "If the user enabled iCloud unlock, the FileVault key is recoverable via Apple's account recovery. macOS Recovery > Disk Utility > Unlock with Apple ID.",
        risk: "low",
      },
      {
        label: "LUKS: check for keyfiles",
        detail:
          "Many LUKS setups use a keyfile (USB token, ~/.luks-keys, /etc/cryptsetup-keys.d). Ask the user where the system was supposed to find the key on boot.",
        risk: "low",
      },
      {
        label: "Mount and image with the recovered key",
        detail:
          "BitLocker on Linux: dislocker. LUKS: cryptsetup luksOpen. FileVault: native macOS unlock. Image the unlocked plaintext volume with ddrescue.",
        risk: "low",
      },
    ],
    abort_signals: [
      "VeraCrypt with a forgotten passphrase and no keyfile - brute force is the only path and is infeasible on strong passphrases.",
      "TPM-bound BitLocker on a motherboard that also died - the TPM-sealed key is gone with the TPM.",
      "FileVault with no Apple ID escrow and no recovery key written down - unrecoverable.",
    ],
    success_rate:
      "95%+ when the key is findable in Microsoft account / iCloud / AD. Near 0% when truly lost. The DIY value is preventing wasted lab spend - no lab can break AES-256 either.",
  },

  format_recognition: {
    id: "format_recognition",
    name: "Identify and mount foreign on-disk formats",
    when_used:
      "Drive enumerates and SMART is clean, but the host shows 'You need to format' or 'Foreign disk' or 'Unallocated'. Almost always a format the current OS doesn't natively understand.",
    difficulty: "easy",
    time_estimate: "30 minutes - 2 hours",
    environment: "normal-bench",
    risk_to_data: "medium",
    parts: [],
    tools: [
      { name: "Linux live USB (Ubuntu / SystemRescue / Hiren's PE)", cost_usd: "0", alternative: "" },
      {
        name: "TestDisk + PhotoRec (read-only signature scan)",
        cost_usd: "0",
        alternative: "",
      },
      {
        name: "UFS Explorer Professional or R-Studio (proprietary RAID)",
        cost_usd: "150-400",
        alternative: "Free trial reads enough to verify the format",
      },
    ],
    steps: [
      {
        label: "STOP - do not click any 'initialize' / 'format' / 'repair' prompt",
        detail:
          "Windows aggressively prompts to initialize unrecognized disks. Clicking 'Yes' overwrites the GPT/MBR with a fresh empty one. The data is recoverable only if you stop here.",
        risk: "high",
      },
      {
        label: "Hex dump LBA 0 and look at the first few sectors",
        detail:
          "Identify: GPT signature 'EFI PART' at LBA 1, MBR boot code, RAID metadata (DDF, mdadm magic 0xA92B4EFC, LVM 'LABELONE', ZFS 'ZBB ZBB'), Apple Core Storage / APFS containers, or unfamiliar filesystem magic.",
        risk: "low",
      },
      {
        label: "RAID member: identify the array type and assemble read-only",
        detail:
          "Linux: `mdadm --examine /dev/sdX` shows mdadm metadata. `pvdisplay` shows LVM. `zpool import -o readonly=on -N <pool>` for ZFS. Hardware RAID often needs UFS Explorer RAID Edition.",
        risk: "medium",
      },
      {
        label: "4Kn drive on a 512n host",
        detail:
          "If `hdparm -I` shows 'Logical Sector size: 4096 bytes' but the host is treating it as 512-byte, swap to a UASP-capable USB3 dock or a host with a modern AHCI controller.",
        risk: "low",
      },
      {
        label: "Apple Fusion / APFS",
        detail:
          "Connect to a Mac. Disk Utility > View > Show All Devices. Fusion drives need both halves; if the SSD half is dead, the APFS metadata is split and recovery requires UFS Explorer or R-Studio with APFS support.",
        risk: "medium",
      },
      {
        label: "HFS+ Time Machine on Windows",
        detail:
          "Use HFSExplorer (free, read-only) or Paragon HFS+ for Windows. Or move the drive to a Mac.",
        risk: "low",
      },
      {
        label: "GPT from a different OS",
        detail:
          "GPT itself is cross-platform. If Windows says the disk is foreign but `gdisk -l` on Linux shows valid partitions, the issue is just driver/filesystem - mount each partition with the right tools.",
        risk: "low",
      },
      {
        label: "Image read-only before any non-trivial mounting",
        detail:
          "ddrescue clone first. Then experiment with the clone, never the original.",
        risk: "low",
      },
    ],
    abort_signals: [
      "User has already clicked 'Initialize' / 'Format' / 'Repair' in Windows - the partition table may be overwritten. From here it's logical_corruption, treat as such.",
      "Hardware RAID with proprietary metadata that no open tool recognises (some old 3Ware, Adaptec firmwares) - escalate to UFS Explorer RAID Edition or a recovery service.",
      "Fusion drive where the SSD half is gone and no APFS-aware tool reads the HDD half cleanly - escalate.",
    ],
    success_rate:
      "85-95% when the format is identified and a compatible host is available. Drops sharply for proprietary RAID with lost configuration.",
  },

  thermal_window_imaging: {
    id: "thermal_window_imaging",
    name: "Thermal-window imaging (cold-works or warm-works drives)",
    when_used:
      "Drive shows clear behavioural difference inside a temperature window - reads only when chilled or only after warm-up. Common on aging drives with marginal preamps and post-thermal-event drives.",
    difficulty: "easy",
    time_estimate: "Multi-session - hours per cooling refresh",
    environment: "normal-bench",
    risk_to_data: "medium",
    parts: [
      {
        name: "Reusable freezer ice packs (3-4 of them, rotate)",
        source: "Supermarket / Amazon",
        cost_usd: "10-15",
        matching: "n/a",
      },
      {
        name: "Vacuum-seal bags or zip-locks with one-way valves",
        source: "Amazon",
        cost_usd: "5-10",
        matching: "Critical for preventing condensation on the PCB during cold cycles.",
      },
      {
        name: "Silica gel desiccant pouches",
        source: "Amazon",
        cost_usd: "5",
        matching: "n/a",
      },
      {
        name: "Seedling heat mat with thermostat (warm-fail variant)",
        source: "Amazon / garden centre",
        cost_usd: "20-30",
        matching: "Set 30-35C maximum. Higher temperatures damage healthy drives.",
      },
    ],
    tools: [
      {
        name: "IR thermometer or laser-point spot thermometer",
        cost_usd: "15-30",
        alternative: "smartctl temperature attribute, polled in a loop",
      },
      { name: "Insulated cooler / lunchbag for the imaging session", cost_usd: "10-15", alternative: "" },
      {
        name: "Small 12V or USB fan (post-cooling steady state)",
        cost_usd: "10-15",
        alternative: "",
      },
    ],
    steps: [
      {
        label: "Confirm the thermal window first",
        detail:
          "Run reads at room temperature, then chilled, then warmed. Identify which state succeeds.",
        risk: "low",
      },
      {
        label: "Cold-works variant: pre-chill the drive in a sealed bag",
        detail:
          "Drive in a vacuum bag or zip-lock with a desiccant pouch. 30 minutes in the FRIDGE, never the freezer. Goal is ~5C - cold enough to constrict expanded clearances, warm enough to avoid condensation.",
        risk: "medium",
      },
      {
        label: "Warm-works variant: pre-warm on a thermostat-controlled mat",
        detail:
          "30-35C on a seedling mat. Stable for 15 minutes before connecting power.",
        risk: "low",
      },
      {
        label: "Connect outside the bag/mat, image immediately",
        detail:
          "Power the drive, run ddrescue with --no-scrape -d -n. Watch the temperature - cold-side imaging usually has a 20-30 minute working window before the drive warms back up.",
        risk: "medium",
      },
      {
        label: "Refresh thermal state and resume",
        detail:
          "ddrescue's mapfile resumes cleanly. Disconnect power, return drive to the cold bag (or warm mat), re-chill / re-warm, repeat.",
        risk: "low",
      },
      {
        label: "Watch for condensation",
        detail:
          "If the PCB shows visible moisture, STOP. Power off. Allow drive to dry fully (24h in a warm dry room) before any further attempts. Powered-on condensation kills more drives than cold ever does.",
        risk: "high",
      },
      {
        label: "Image to completion, then stop attempting recovery",
        detail:
          "Once you have a full image, no further work on the original. Filesystem recovery happens on the clone.",
        risk: "low",
      },
    ],
    abort_signals: [
      "Condensation visible on the PCB or HDA.",
      "Drive starts clicking after cold cycle (you've revealed an underlying mechanical fault, escalate).",
      "No clear temperature window - drive is equally bad at all temperatures (failure mode is not thermal).",
    ],
    success_rate:
      "60-85% completion of a full clone when the symptom is genuinely thermal. Often the only DIY path for marginal preamps and cold-side seek issues.",
  },

  partial_head_imaging: {
    id: "partial_head_imaging",
    name: "Partial head imaging (rescue working surfaces, decide on HSA later)",
    when_used:
      "ddrescue map shows a regular striped pattern indicating some heads are dead. Working-head data can be recovered with no cleanroom; the customer then decides whether to escalate to HSA swap for the dead-head surfaces.",
    difficulty: "moderate",
    time_estimate: "Hours-to-days depending on capacity",
    environment: "normal-bench",
    risk_to_data: "low",
    parts: [
      {
        name: "Target drive 1.2x patient capacity",
        source: "Any reliable HDD or SSD",
        cost_usd: "varies",
        matching: "n/a",
      },
    ],
    tools: [
      { name: "ddrescue + ddrescueview", cost_usd: "0", alternative: "" },
      {
        name: "Awk / Python to filter the mapfile by head-modulo regions",
        cost_usd: "0",
        alternative: "",
      },
      {
        name: "(Optional) PC-3000 or similar with head-exclusion support",
        cost_usd: "5000+",
        alternative: "Manual stripe-skipping in ddrescue is workable",
      },
    ],
    steps: [
      {
        label: "Run ddrescue first pass to characterise the stripe",
        detail:
          "Standard `ddrescue -d -n -r0` to a target drive. Watch the bad-region pattern emerge - a regular stripe means head failure, random scatter means bad sectors.",
        risk: "low",
      },
      {
        label: "Measure the stripe period",
        detail:
          "ddrescueview shows the visualisation. Stripe period typically equals the drive's track-group allocation (256 MB - 2 GB). Stripe period / good band size = working heads / total heads.",
        risk: "low",
      },
      {
        label: "Skip dead-head bands fast",
        detail:
          "Use `ddrescue --skip-size=64MiB` or larger so the tool jumps past entire dead-head regions instead of grinding on every sector. The mapfile will mark these regions as 'non-trimmed' for later.",
        risk: "low",
      },
      {
        label: "(Optional, Seagate F3) Disable specific heads via ATA",
        detail:
          "Some Seagate firmware accepts vendor commands to read only specified heads. Reduces wear on the working heads during long-running imaging.",
        risk: "medium",
      },
      {
        label: "Recover the filesystem from the partial image",
        detail:
          "Mount the partial image read-only with TestDisk / R-Studio. Files entirely on working heads recover cleanly. Files spanning a dead-head band are partial - the file content is interleaved by sector across heads, so you'll lose proportional fractions.",
        risk: "low",
      },
      {
        label: "Decide on HSA swap for the missing surfaces",
        detail:
          "If the customer needs the data on the dead-head surfaces, escalate to the head_stack_assembly_swap playbook. If the working-head data is all they need (often the case for OS + user files), stop here.",
        risk: "medium",
      },
    ],
    abort_signals: [
      "Stripe pattern shows MORE than ~50% of heads failing - failure is cascading, image fast and stop, do not retry.",
      "Audible grinding develops during imaging - debris from a failed head is being scraped onto remaining surfaces.",
      "Customer has only photos / videos that span entire surfaces sequentially (no file is fully on a single head) - partial recovery may yield low-value fragments.",
    ],
    success_rate:
      "70-95% recovery of working-head data with no cleanroom or specialist tools. Recovery of dead-head surfaces inherits HSA swap success rate (30-50% DIY, 70-85% with PC-3000).",
  },

  parking_ramp_swap: {
    id: "parking_ramp_swap",
    name: "Donor parking ramp swap (heads still parked correctly)",
    when_used:
      "Drive performs a slow rhythmic load-retract-load cycle on power-up. Inspection shows a cracked or dislodged plastic parking ramp. Heads are still parked on the ramp (have NOT contacted the platter).",
    difficulty: "moderate",
    time_estimate: "1-2 hours",
    environment: "dust-mitigated",
    risk_to_data: "high",
    parts: [
      {
        name: "Donor parking ramp from a same-family drive",
        source:
          "Salvage from same-model drive (donordrives.com, eBay matched, e-waste yards for older models)",
        cost_usd: "30-100 (full donor) or salvage",
        matching:
          "Same model + similar generation. Ramp geometry varies between 2.5 and 3.5 inch and platter count - a WD 3.5\" 1-platter ramp will not fit a 4-platter drive.",
      },
    ],
    tools: [
      {
        name: "T6/T8 Torx drivers (Wiha or Wera)",
        cost_usd: "30-50",
        alternative: "Cheap bits strip the small screws - do not compromise here",
      },
      {
        name: "Plastic spudger / non-marring pry tool",
        cost_usd: "5",
        alternative: "",
      },
      {
        name: "Tier 2 DIY laminar flow hood (see Reference > Clean environment)",
        cost_usd: "125-185",
        alternative:
          "Bathroom-steam (Tier 1) is too risky for any work where heads are exposed",
      },
      {
        name: "Bright LED inspection light",
        cost_usd: "10",
        alternative: "Phone flashlight at low angle",
      },
    ],
    steps: [
      {
        label: "Confirm symptom: slow load-retract cycle, not clicking",
        detail:
          "Listen carefully. A 1-3 second rhythmic load-retract-load pattern points at the ramp. Rapid clicks point at head failure - do not open in that case, this procedure won't help.",
        risk: "low",
      },
      {
        label: "Inspect the donor first",
        detail:
          "Photograph donor's ramp. Confirm geometry matches before committing.",
        risk: "low",
      },
      {
        label: "Pre-flight the clean environment",
        detail:
          "Run the laminar flow hood for 15 minutes before opening. Wipe surfaces with IPA. Hairnet, mask, gloves. No carpets, no clothing fibres in the air.",
        risk: "high",
      },
      {
        label: "Open the donor, photograph the ramp area",
        detail:
          "Cover screws (often 6-9 T8, one under the warranty sticker). Note exactly how the ramp is fixed - some are screwed, some are press-fit, some are clipped.",
        risk: "medium",
      },
      {
        label: "Remove the donor ramp",
        detail:
          "The ramp lives outboard of the HSA pivot - removing it does not require disturbing the heads. Lift carefully so the donor is preserved as a future emergency part.",
        risk: "medium",
      },
      {
        label: "Open the patient",
        detail:
          "Same procedure. Confirm patient's heads are still parked on the ramp - if they've fallen, this becomes head_stack_assembly_swap territory.",
        risk: "high",
      },
      {
        label: "Remove the patient's broken ramp without disturbing the heads",
        detail:
          "If the patient's ramp is fragmented, work carefully to capture every piece. Any debris left in the HDA causes future head crashes. A piece of clean micropore tape can lift small fragments.",
        risk: "high",
      },
      {
        label: "Install the donor ramp",
        detail:
          "Same orientation, same fixation method. Hand-tighten. The ramp's load surfaces must align with the head sliders' approach paths.",
        risk: "high",
      },
      {
        label: "Close the cover, image immediately",
        detail:
          "Two diagonal screws are enough for short-term dust protection. Power up, listen for normal load and seek, ddrescue to a target drive.",
        risk: "medium",
      },
    ],
    abort_signals: [
      "Patient heads have already fallen onto the platter (visual: head sliders sitting on platter surface, not on the ramp) - this is now an HSA swap.",
      "Plastic fragments visible on the platter (debris contamination).",
      "Ramp geometry doesn't match the donor (different platter count or model variant).",
      "Helium drive - sealed, ramp swap is impossible without breaking the seal.",
    ],
    success_rate:
      "60-80% if heads are still parked correctly and only the ramp is damaged. Drops to head-swap success rate if heads have already contacted the platter.",
  },

  donor_magnet_swap: {
    id: "donor_magnet_swap",
    name: "Donor top-magnet assembly swap",
    when_used:
      "Heads seek erratically (overshoot, oscillation, hunting), coil resistance tests good (4-20 ohms), and visual inspection of the top magnet shows a crack or displaced magnet from a drop event.",
    difficulty: "moderate",
    time_estimate: "1-2 hours",
    environment: "dust-mitigated",
    risk_to_data: "medium",
    parts: [
      {
        name: "Donor top-magnet + yoke assembly",
        source:
          "Salvage from matched donor (donordrives.com, eBay matched, e-waste yards)",
        cost_usd: "30-100 (full donor) or salvage",
        matching:
          "Same family. Magnet strength and yoke geometry vary - WD vs Seagate are not interchangeable. Same-model donor preferred but same-family often works for the top magnet.",
      },
      {
        name: "Loctite 243 medium thread locker (for re-seating screws)",
        source: "Hardware store",
        cost_usd: "8",
        matching: "n/a",
      },
    ],
    tools: [
      {
        name: "T6/T8 Torx drivers (quality)",
        cost_usd: "30-50",
        alternative: "",
      },
      {
        name: "Magnet pry tool or thick plastic wedge",
        cost_usd: "5",
        alternative:
          "Two flathead screwdrivers used as a wedge. The top magnet has VERY strong neodymium pull - do not use bare hands.",
      },
      {
        name: "Tier 2 DIY laminar flow hood",
        cost_usd: "125-185",
        alternative: "",
      },
    ],
    steps: [
      {
        label: "Confirm coil is healthy, magnet damaged",
        detail:
          "Multimeter on coil pads - 4-20 ohms = good. Visual on the top magnet (after carefully removing the cover) - cracks, fragments, or visible displacement of the magnet inside its yoke confirm magnet damage.",
        risk: "medium",
      },
      {
        label: "Pre-flight the clean environment",
        detail:
          "Same as parking ramp swap. Run hood, wipe surfaces, full PPE.",
        risk: "high",
      },
      {
        label: "Photograph original orientation",
        detail:
          "Magnet polarity matters - reversing the magnet will reverse the actuator's drive direction. Photograph from multiple angles before disturbing.",
        risk: "low",
      },
      {
        label: "Wedge the top magnet plate off",
        detail:
          "T6 screws hold the top magnet plate. After removing screws, slide a thick plastic wedge between the top plate and the lower yoke - the pull is severe (5-15 lbs). Pry slowly and evenly.",
        risk: "high",
      },
      {
        label: "Inspect for fragments on the platter",
        detail:
          "Cracked neodymium sheds tiny fragments. Any visible particles on the platter - STOP. Powering on grinds them in. The recovery has shifted to platter contamination.",
        risk: "high",
      },
      {
        label: "Install the donor magnet plate",
        detail:
          "Same orientation as the original (use your photograph). Lower carefully against the lower yoke - the pull will snap it the last 2-3 mm. Reinstall T6 screws with Loctite 243 (medium).",
        risk: "high",
      },
      {
        label: "Close the cover, power up, image",
        detail:
          "Two diagonal cover screws for dust protection. Power up, listen for clean seek behaviour, ddrescue immediately.",
        risk: "medium",
      },
    ],
    abort_signals: [
      "Visible neodymium fragments on the platter.",
      "Yoke is bent (not just the magnet) - more likely a head-swap is also needed.",
      "Drive was dropped hard enough to crack the magnet - inspect platters first; head crash often accompanies magnet damage.",
      "Helium drive - sealed.",
    ],
    success_rate:
      "50-70% for clean re-seat of a dislodged-but-intact magnet. 60-75% for donor magnet swap on confirmed cracked magnet. Drops sharply if any neodymium fragments contaminated the platters.",
  },

  counterfeit_diagnosis: {
    id: "counterfeit_diagnosis",
    name: "Counterfeit drive diagnosis and capacity-true partition",
    when_used:
      "Suspect counterfeit drive (cheap marketplace listing, model not on manufacturer's site, weight wrong, files come back as garbage). Goal is to confirm the lie and salvage the genuine portion.",
    difficulty: "easy",
    time_estimate: "Hours-to-days for full-capacity verification",
    environment: "normal-bench",
    risk_to_data: "destructive",
    parts: [],
    tools: [
      { name: "h2testw (Windows, free)", cost_usd: "0", alternative: "" },
      { name: "f3 (Linux/macOS, free)", cost_usd: "0", alternative: "" },
      { name: "fdisk / gdisk for re-partitioning", cost_usd: "0", alternative: "" },
    ],
    steps: [
      {
        label: "Back up any data the user wrote that fits in the first ~10% of capacity",
        detail:
          "Counterfeits typically have a small genuine region (32 GB to 1 TB) and report something much larger. Anything stored in the first few GB is on real media; everything past the boundary is gone.",
        risk: "high",
      },
      {
        label: "Wipe the drive (you've already saved what's salvageable)",
        detail:
          "f3probe and h2testw need write access across the full reported capacity. Format the drive to a single partition first.",
        risk: "destructive",
      },
      {
        label: "Run f3probe (Linux) or h2testw (Windows)",
        detail:
          "f3probe --destructive --time-ops on the block device gives the cleanest answer ('Real size: X GB / Announced size: Y GB'). h2testw writes test files across the mounted partition.",
        risk: "destructive",
      },
      {
        label: "Read the verified-real capacity",
        detail:
          "f3probe prints it directly. h2testw shows where verification fails.",
        risk: "low",
      },
      {
        label: "Re-partition to the genuine size only",
        detail:
          "Use fdisk / gdisk / Disk Management to create a single partition limited to the real capacity. Anything past it would silently fail again.",
        risk: "low",
      },
      {
        label: "Mark the drive clearly so it's not accidentally used at full advertised size",
        detail:
          "Sticker on top with the real capacity. Donate it to non-critical use.",
        risk: "low",
      },
      {
        label: "If sold as new, request a refund and report the seller",
        detail:
          "Amazon, eBay, AliExpress all have anti-counterfeit refund policies. h2testw / f3probe screenshots are accepted as evidence.",
        risk: "low",
      },
    ],
    abort_signals: [
      "User wrote critical data past the genuine capacity threshold expecting it to be saved - that data is gone, period. No recovery is possible because it was never stored.",
      "Drive's firmware actively refuses identity queries to mask the underlying chip - the imitation is sophisticated, manufacturer reflash is unavailable.",
    ],
    success_rate:
      "100% at exposing the scam. Recovery of any data the user wrote past the genuine boundary: 0%. Recovery of data within the genuine capacity: 80%+ via standard imaging.",
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
