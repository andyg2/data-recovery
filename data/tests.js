// Each test is a question or procedure. For every possible answer, we list
// which hypothesis IDs it RULES OUT. The engine uses these to compute the
// remaining hypothesis set after each step.
//
// `risk` lets the engine deprioritise dangerous tests when the remaining
// hypothesis set includes mechanical failures:
//   none   — purely informational (look at it, ask the customer)
//   low    — software-only, no power applied unnecessarily
//   medium — repeated power cycles, light disassembly
//   high   — anything that could finish off a dying drive
//
// `phase` mirrors hypotheses.js — shop / lab / both.
export const tests = [
  {
    id: "sounds",
    phase: "shop",
    question: "What does the drive sound like when powered on?",
    detail:
      "Listen carefully. Clicking, beeping, or grinding tells you a lot before you do anything else.",
    risk: "low",
    answers: [
      {
        id: "normal",
        label: "Normal — quiet spin-up, no clicking",
        eliminates: [
          "head_crash",
          "stiction_seized_motor",
          "tvs_diode_short",
          "spindle_motor_ic_failure",
          "head_crash_drop_event",
        ],
      },
      {
        id: "clicking",
        label: "Clicking, beeping, or repeating seek noise",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "preamp_contact_issue",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "tvs_diode_short",
          "spindle_motor_ic_failure",
          "actuator_coil_open",
        ],
        warning:
          "Stop powering this drive on. Each spin-up risks further platter damage.",
      },
      {
        id: "silent",
        label: "Silent — no spin-up at all",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "firmware_sa_corruption",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "translator_corruption",
          "glist_overflow",
          "spindle_bearing_wear",
          "actuator_coil_open",
          "head_crash_drop_event",
          "helium_leak",
        ],
      },
      {
        id: "grinding",
        label: "Grinding or scraping",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "firmware_sa_corruption",
          "preamp_contact_issue",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "tvs_diode_short",
          "translator_corruption",
          "spindle_motor_ic_failure",
          "actuator_coil_open",
          "rom_nvram_corruption",
        ],
        warning: "Almost certainly platter contact. Power down immediately.",
      },
    ],
  },
  {
    id: "bios_id",
    phase: "shop",
    question: "Does BIOS detect the drive with the correct model and capacity?",
    detail:
      "Boot into BIOS/UEFI and check whether the drive is identified, and whether the capacity matches the label.",
    risk: "low",
    answers: [
      {
        id: "correct",
        label: "Detected correctly, full capacity",
        eliminates: [
          "pcb_failure",
          "firmware_sa_corruption",
          "stiction_seized_motor",
          "tvs_diode_short",
          "spindle_motor_ic_failure",
          "rom_nvram_corruption",
          "translator_corruption",
        ],
      },
      {
        id: "wrong",
        label: "Detected, but wrong model or capacity",
        eliminates: [
          "pcb_failure",
          "logical_corruption",
          "bad_sectors_minor",
          "stiction_seized_motor",
          "tvs_diode_short",
          "spindle_motor_ic_failure",
          "ata_password_locked",
        ],
      },
      {
        id: "not_detected",
        label: "Not detected at all",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "translator_corruption",
          "glist_overflow",
          "spindle_bearing_wear",
        ],
      },
    ],
  },
  {
    id: "preamp_clean",
    phase: "shop",
    question:
      "After cleaning the pre-amp contacts, does BIOS now detect the drive correctly?",
    detail:
      "Disconnect the PCB, clean the contact pads with isopropyl alcohol and a pencil eraser, reseat, and retest.",
    risk: "medium",
    answers: [
      {
        id: "fixed",
        label: "Yes, drive now IDs correctly",
        eliminates: ["pcb_failure", "firmware_sa_corruption", "head_crash"],
      },
      {
        id: "still_fails",
        label: "No, still fails to ID",
        eliminates: ["preamp_contact_issue"],
      },
    ],
  },
  {
    id: "smart",
    phase: "shop",
    question: "What does S.M.A.R.T. report?",
    detail:
      "Use a tool like CrystalDiskInfo or smartctl. Look at reallocated, pending, and uncorrectable sector counts.",
    risk: "low",
    answers: [
      {
        id: "pass",
        label: "All values nominal",
        eliminates: [
          "head_degradation",
          "firmware_sa_corruption",
          "pcb_failure",
          "glist_overflow",
          "spindle_bearing_wear",
          "helium_leak",
        ],
      },
      {
        id: "fail_sectors",
        label: "Reallocated / pending sectors flagged",
        eliminates: [
          "logical_corruption",
          "pcb_failure",
          "firmware_sa_corruption",
          "ata_password_locked",
          "hpa_dco_misconfigured",
        ],
      },
      {
        id: "fail_unreadable",
        label: "S.M.A.R.T. data is unreadable",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "ata_password_locked",
          "hpa_dco_misconfigured",
        ],
      },
    ],
  },
  {
    id: "clone_attempt",
    phase: "shop",
    question:
      "What happens when you try to clone the drive with ddrescue or HDDSuperClone?",
    detail:
      "Use Linux-based ddrescue or HDDSuperClone — they handle bad sectors gracefully. Avoid Clonezilla / dd, which give up on errors.",
    risk: "medium",
    answers: [
      {
        id: "clean",
        label: "Completes cleanly or with minimal bad sectors",
        eliminates: [
          "head_degradation",
          "head_crash",
          "firmware_sa_corruption",
          "pcb_failure",
          "bad_sectors_major",
          "platter_damage",
          "stiction_seized_motor",
          "tvs_diode_short",
          "ata_password_locked",
          "translator_corruption",
          "glist_overflow",
          "spindle_motor_ic_failure",
          "spindle_bearing_wear",
          "actuator_coil_open",
          "rom_nvram_corruption",
          "head_crash_drop_event",
          "helium_leak",
        ],
      },
      {
        id: "partial",
        label: "Slow, many unread sectors, eventually completes",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "pcb_failure",
          "firmware_sa_corruption",
          "tvs_diode_short",
          "ata_password_locked",
          "spindle_motor_ic_failure",
          "actuator_coil_open",
          "rom_nvram_corruption",
        ],
      },
      {
        id: "fails",
        label: "Fails — drive drops out, hangs, or aborts",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "ata_password_locked",
          "hpa_dco_misconfigured",
        ],
      },
    ],
  },
  {
    id: "fs_scan",
    phase: "shop",
    question:
      "After cloning, does a filesystem recovery scan (R-Studio / UFS Explorer) find the data?",
    detail: "Run the scan against the CLONE, never the original drive.",
    risk: "none",
    answers: [
      {
        id: "success",
        label: "Yes — files recovered",
        eliminates: ["head_crash", "platter_damage", "firmware_sa_corruption"],
      },
      {
        id: "fail",
        label: "No — scan fails or finds nothing usable",
        eliminates: ["logical_corruption", "bad_sectors_minor"],
      },
    ],
  },

  // Lab-phase tests — only surface in technician mode once we're past the shop boundary
  {
    id: "pcb_swap",
    phase: "lab",
    question:
      "After fitting a donor PCB with the original ROM, does the drive ID correctly?",
    detail:
      "Cross-reference the PCB part number, transfer the ROM chip or BIOS adaptives, and retest.",
    risk: "low",
    answers: [
      {
        id: "ids",
        label: "Yes, drive IDs correctly",
        eliminates: [
          "firmware_sa_corruption",
          "head_crash",
          "stiction_seized_motor",
        ],
      },
      {
        id: "still_fails",
        label: "No, still fails",
        eliminates: ["pcb_failure"],
      },
    ],
  },
  {
    id: "head_test",
    phase: "lab",
    question: "What does a head test on the PC-3000 show?",
    detail:
      "Run the per-head test in PC-3000 utilities. Note which heads pass and which fail.",
    risk: "medium",
    answers: [
      {
        id: "all_pass",
        label: "All heads pass",
        eliminates: ["head_crash", "head_degradation"],
      },
      {
        id: "some_fail",
        label: "Some heads fail",
        eliminates: [
          "logical_corruption",
          "pcb_failure",
          "firmware_sa_corruption",
        ],
      },
    ],
  },
  {
    id: "visual_inspection",
    phase: "lab",
    question:
      "Visual inspection of the platters in the cleanroom — what do you see?",
    detail:
      "Open the drive in a clean environment. Look for circular scratches, oxidation rings, or debris.",
    risk: "none",
    answers: [
      {
        id: "clean",
        label: "Platters clean, no visible damage",
        eliminates: ["platter_damage"],
      },
      {
        id: "damaged",
        label: "Visible scratches, rings, or contamination",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "pcb_failure",
          "firmware_sa_corruption",
        ],
      },
    ],
  },

  // --- Additional tests for the expanded hypothesis set ---

  {
    id: "event_history",
    phase: "shop",
    question: "Was there a known event right before the drive failed?",
    detail:
      "Knowing the trigger event massively narrows the field. Ask the customer; check for swollen capacitors, scorch marks, water residue.",
    risk: "none",
    answers: [
      {
        id: "none",
        label: "No - just stopped working / gradual decline",
        eliminates: [
          "tvs_diode_short",
          "head_crash_drop_event",
          "liquid_corrosion_damage",
        ],
      },
      {
        id: "power_surge",
        label: "Power surge, wrong adapter, or PSU failure",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "head_degradation",
          "stiction_seized_motor",
          "platter_damage",
          "spindle_bearing_wear",
          "head_crash_drop_event",
          "liquid_corrosion_damage",
          "helium_leak",
        ],
      },
      {
        id: "drop_or_impact",
        label: "Dropped or hit while running",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "pcb_failure",
          "tvs_diode_short",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "rom_nvram_corruption",
          "liquid_corrosion_damage",
        ],
        warning:
          "Stop powering on. Loose debris is being scraped across the platters every spin-up.",
      },
      {
        id: "liquid_or_corrosion",
        label: "Water, condensation, or visible corrosion",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "head_crash_drop_event",
          "helium_leak",
        ],
      },
      {
        id: "long_storage",
        label: "Sat unpowered for years (pre-2008 drive)",
        eliminates: [
          "tvs_diode_short",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "rom_nvram_corruption",
          "head_crash_drop_event",
          "liquid_corrosion_damage",
        ],
      },
    ],
  },

  {
    id: "tvs_check",
    phase: "shop",
    question:
      "With PCB removed, does a multimeter in diode-mode show either TVS diode shorted?",
    detail:
      "TVS diodes are the small SMB-package components near the SATA power connector. A shorted one beeps in continuity / reads under 5 ohms. A healthy one reads open in both directions.",
    risk: "low",
    answers: [
      {
        id: "shorted",
        label: "One or both TVS diodes test shorted",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "head_crash",
          "stiction_seized_motor",
          "platter_damage",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "translator_corruption",
          "glist_overflow",
          "spindle_bearing_wear",
          "actuator_coil_open",
          "rom_nvram_corruption",
          "head_crash_drop_event",
          "helium_leak",
          "firmware_sa_corruption",
        ],
      },
      {
        id: "ok",
        label: "Both TVS test fine",
        eliminates: ["tvs_diode_short"],
      },
    ],
  },

  {
    id: "security_check",
    phase: "shop",
    question: "What does `hdparm -I` (or vendor tool) report under Security?",
    detail:
      "On Linux: `sudo hdparm -I /dev/sdX | grep -A8 Security`. On Windows use Victoria or HDD Sentinel. Look at the locked / enabled / frozen flags.",
    risk: "low",
    answers: [
      {
        id: "not_enabled",
        label: "Security: not enabled, not locked",
        eliminates: ["ata_password_locked"],
      },
      {
        id: "enabled_locked",
        label: "Security: enabled, locked",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "pcb_failure",
          "firmware_sa_corruption",
          "head_degradation",
          "head_crash",
          "stiction_seized_motor",
          "platter_damage",
          "tvs_diode_short",
          "translator_corruption",
          "glist_overflow",
          "spindle_motor_ic_failure",
          "spindle_bearing_wear",
          "actuator_coil_open",
          "rom_nvram_corruption",
          "head_crash_drop_event",
          "helium_leak",
          "hpa_dco_misconfigured",
        ],
      },
      {
        id: "frozen",
        label: "Security: frozen (BIOS-frozen, can't manage either way)",
        eliminates: [],
      },
    ],
  },

  {
    id: "capacity_check",
    phase: "shop",
    question:
      "Does the OS-reported capacity match the printed label (within ~5%)?",
    detail:
      "Compare `hdparm -I`/`Get-PhysicalDisk` size against the model's spec. Mismatched capacity is a strong signal for HPA/DCO or SA corruption.",
    risk: "low",
    answers: [
      {
        id: "matches",
        label: "Yes, full advertised capacity",
        eliminates: ["hpa_dco_misconfigured"],
      },
      {
        id: "smaller_round",
        label: "Smaller, but a clean round number (looks like HPA)",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "head_degradation",
          "head_crash",
          "platter_damage",
          "tvs_diode_short",
          "translator_corruption",
          "spindle_bearing_wear",
        ],
      },
      {
        id: "wrong_garbage",
        label: "Wildly wrong (0, 1.4GB, garbage values)",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "platter_damage",
          "ata_password_locked",
          "hpa_dco_misconfigured",
        ],
      },
    ],
  },

  {
    id: "read_test",
    phase: "shop",
    question:
      "Reading the first physical sector with `dd` / `Get-Content` returns what?",
    detail:
      "Linux: `sudo dd if=${DEVICE} of=/dev/null bs=512 count=1`. Captures whether the drive can serve any data at all.",
    risk: "low",
    answers: [
      {
        id: "data",
        label: "Real data (1 sector copied, no error)",
        eliminates: ["translator_corruption", "actuator_coil_open"],
      },
      {
        id: "zeros",
        label: "Zeros, despite the drive identifying correctly",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "stiction_seized_motor",
          "pcb_failure",
          "tvs_diode_short",
          "ata_password_locked",
          "hpa_dco_misconfigured",
        ],
      },
      {
        id: "io_error",
        label: "I/O error or hang",
        eliminates: ["logical_corruption", "ata_password_locked"],
      },
    ],
  },

  {
    id: "seek_audio",
    phase: "shop",
    question:
      "Within 5 seconds of spin-up, do you hear ANY seek / click / calibration sound?",
    detail:
      "Healthy drives produce a single soft seek immediately after spin-up. Total silence after spin-up points at actuator coil failure.",
    risk: "low",
    answers: [
      {
        id: "normal_seeks",
        label: "Yes - normal seek sound, single soft click",
        eliminates: ["actuator_coil_open"],
      },
      {
        id: "silent_after_spin",
        label: "Spins to full RPM and stays silent - no head movement",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "pcb_failure",
          "stiction_seized_motor",
          "tvs_diode_short",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "spindle_motor_ic_failure",
          "head_crash",
          "head_crash_drop_event",
        ],
      },
      {
        id: "did_not_spin",
        label: "Drive never spun up (skip this question)",
        eliminates: [],
      },
    ],
  },

  {
    id: "helium_check",
    phase: "shop",
    question:
      "Is this a helium-sealed model AND is SMART attribute 22 (Helium_Level) below 100?",
    detail:
      "Helium drives are typically 8TB+ enterprise SKUs (HGST He, WD Ultrastar, Seagate Exos). The model label, datasheet, or smartctl will say. Attribute 22 starts at 100 and counts down as helium escapes.",
    risk: "low",
    answers: [
      {
        id: "not_helium",
        label: "Not a helium-filled model",
        eliminates: ["helium_leak"],
      },
      {
        id: "helium_full",
        label: "Helium drive, attribute 22 reads 100",
        eliminates: ["helium_leak"],
      },
      {
        id: "helium_low",
        label: "Helium drive, attribute 22 below 100",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "pcb_failure",
          "tvs_diode_short",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "stiction_seized_motor",
          "preamp_contact_issue",
        ],
        warning:
          "Image urgently. As more air enters, fly-height collapses on every surface simultaneously.",
      },
    ],
  },

  {
    id: "rom_transfer",
    phase: "lab",
    question:
      "After transferring the original ROM chip onto the donor PCB, does the drive ID?",
    detail:
      "If a plain donor PCB swap failed, read the original ROM with a CH341A programmer and write it to the donor's flash chip. Re-test detection.",
    risk: "low",
    answers: [
      {
        id: "ids_now",
        label: "Yes, drive IDs correctly with transferred ROM",
        eliminates: [
          "rom_nvram_corruption",
          "firmware_sa_corruption",
          "head_crash",
          "stiction_seized_motor",
        ],
      },
      {
        id: "still_fails",
        label: "No, still fails to ID with transferred ROM",
        eliminates: ["rom_nvram_corruption"],
      },
      {
        id: "rom_unreadable",
        label: "Original ROM reads as garbage / all-FF",
        eliminates: [
          "pcb_failure",
          "logical_corruption",
          "bad_sectors_minor",
          "head_crash",
          "stiction_seized_motor",
        ],
      },
    ],
  },
];

export const testById = Object.fromEntries(tests.map((t) => [t.id, t]));
