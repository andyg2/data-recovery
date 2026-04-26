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
        label: "Normal - quiet spin-up, no clicking",
        eliminates: [
          "head_crash",
          "stiction_seized_motor",
          "tvs_diode_short",
          "spindle_motor_ic_failure",
          "head_crash_drop_event",
          "slow_calibration_loop",
          "parking_ramp_damage",
          "magnet_dislodged_or_cracked",
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
          "vcm_driver_ic_failure",
          "scsi_sata_phy_dead",
          "usb_bridge_failure",
          "encrypted_bridge_keyloss",
          "host_software_encryption",
          "capacity_barrier_host",
          "host_misinterprets_drive",
          "sed_lost_encryption_key",
          "counterfeit_capacity_spoofed",
        ],
        warning:
          "Stop powering this drive on. Each spin-up risks further platter damage.",
      },
      {
        id: "silent",
        label: "Silent - no spin-up at all",
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
          "slow_calibration_loop",
          "smart_log_corruption_lockout",
          "plist_corruption_remap_loop",
          "head_flex_cable_damage",
          "parking_ramp_damage",
          "partial_head_failure",
          "magnet_dislodged_or_cracked",
          "host_software_encryption",
          "capacity_barrier_host",
          "host_misinterprets_drive",
          "sshd_cache_failure",
          "smr_write_zone_corruption",
          "counterfeit_capacity_spoofed",
          "sed_lost_encryption_key",
          "encrypted_bridge_keyloss",
          "vcm_driver_ic_failure",
          "scsi_sata_phy_dead",
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
          "vcm_driver_ic_failure",
          "scsi_sata_phy_dead",
          "slow_calibration_loop",
          "smart_log_corruption_lockout",
          "plist_corruption_remap_loop",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "capacity_barrier_host",
          "host_misinterprets_drive",
          "sed_lost_encryption_key",
          "counterfeit_capacity_spoofed",
          "smr_write_zone_corruption",
          "sshd_cache_failure",
          "usb_bridge_failure",
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
          "usb_bridge_failure",
          "external_power_misadventure",
          "scsi_sata_phy_dead",
          "vcm_driver_ic_failure",
          "capacity_barrier_host",
          "head_flex_cable_damage",
          "parking_ramp_damage",
          "magnet_dislodged_or_cracked",
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
          "usb_bridge_failure",
          "external_power_misadventure",
          "vcm_driver_ic_failure",
          "scsi_sata_phy_dead",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "host_misinterprets_drive",
          "sed_lost_encryption_key",
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
          "encrypted_bridge_keyloss",
          "host_software_encryption",
          "host_misinterprets_drive",
          "capacity_barrier_host",
          "counterfeit_capacity_spoofed",
          "sed_lost_encryption_key",
          "plist_corruption_remap_loop",
          "partial_head_failure",
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
          "smr_write_zone_corruption",
          "sshd_cache_failure",
        ],
      },
      {
        id: "thermal_event",
        label: "Hot car / attic / fire-adjacent / extreme heat exposure",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "head_crash_drop_event",
          "tvs_diode_short",
          "stiction_seized_motor",
        ],
      },
      {
        id: "power_loss_during_write",
        label: "Sudden power loss during a heavy write (file copy, large download)",
        eliminates: [
          "stiction_seized_motor",
          "platter_damage",
          "head_crash_drop_event",
          "spindle_bearing_wear",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "tvs_diode_short",
          "liquid_corrosion_damage",
        ],
      },
      {
        id: "wrong_adapter",
        label: "Wrong barrel-jack adapter, reverse polarity, or low-power USB hub",
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
          "smr_write_zone_corruption",
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

  // --- Round 2 tests for the expanded hypothesis set ---

  {
    id: "enclosure_shuck",
    phase: "shop",
    question:
      "Is this an external (USB) drive, and if so what happens after shucking it and connecting directly to SATA?",
    detail:
      "External drives wrap a SATA HDD in a USB-SATA bridge. A dead bridge looks identical to a dead drive from the outside. Open the enclosure, plug the bare drive into a desktop SATA port (or a different known-good USB-SATA dock).",
    risk: "low",
    answers: [
      {
        id: "internal_drive",
        label: "Drive is internal / bare SATA - shuck test does not apply",
        eliminates: [
          "usb_bridge_failure",
          "encrypted_bridge_keyloss",
          "external_power_misadventure",
        ],
      },
      {
        id: "ids_when_shucked",
        label: "External drive - identifies normally on direct SATA",
        eliminates: [
          "pcb_failure",
          "tvs_diode_short",
          "rom_nvram_corruption",
          "firmware_sa_corruption",
          "stiction_seized_motor",
          "spindle_motor_ic_failure",
          "actuator_coil_open",
          "head_crash",
          "vcm_driver_ic_failure",
          "scsi_sata_phy_dead",
          "encrypted_bridge_keyloss",
        ],
      },
      {
        id: "ids_but_random",
        label: "External drive - identifies on direct SATA but data is unreadable random noise",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "pcb_failure",
          "tvs_diode_short",
          "stiction_seized_motor",
          "spindle_motor_ic_failure",
          "translator_corruption",
          "head_crash",
          "head_degradation",
          "platter_damage",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "usb_bridge_failure",
        ],
      },
      {
        id: "still_dead_when_shucked",
        label: "External drive - still dead on direct SATA",
        eliminates: ["usb_bridge_failure", "encrypted_bridge_keyloss"],
      },
    ],
  },

  {
    id: "data_signature",
    phase: "shop",
    question:
      "What do the first few MB of the drive look like in a hex viewer (after the drive IDs)?",
    detail:
      "Read LBA 0 through ~16MB. Look for filesystem magic bytes (NTFS, FAT, ext, HFS+, APFS), encryption headers (BitLocker '-FVE-FS-', LUKS magic, FileVault encrdsa), or uniformly random data with no structure at all.",
    risk: "low",
    answers: [
      {
        id: "normal_filesystem",
        label: "Normal filesystem signature (NTFS, FAT, ext, HFS+, APFS, exFAT)",
        eliminates: [
          "encrypted_bridge_keyloss",
          "host_software_encryption",
          "sed_lost_encryption_key",
          "translator_corruption",
        ],
      },
      {
        id: "bitlocker",
        label: "BitLocker signature ('-FVE-FS-' at offset 3 of partition)",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "translator_corruption",
          "encrypted_bridge_keyloss",
          "head_degradation",
          "head_crash",
          "head_crash_drop_event",
          "platter_damage",
          "firmware_sa_corruption",
          "sed_lost_encryption_key",
          "counterfeit_capacity_spoofed",
          "preamp_contact_issue",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "glist_overflow",
          "liquid_corrosion_damage",
          "smart_log_corruption_lockout",
          "plist_corruption_remap_loop",
          "partial_head_failure",
          "thermal_dependent_failure",
          "host_misinterprets_drive",
          "sshd_cache_failure",
          "smr_write_zone_corruption",
          "vcm_driver_ic_failure",
          "scsi_sata_phy_dead",
          "slow_calibration_loop",
          "head_flex_cable_damage",
          "parking_ramp_damage",
          "magnet_dislodged_or_cracked",
          "actuator_coil_open",
          "stiction_seized_motor",
          "spindle_motor_ic_failure",
          "spindle_bearing_wear",
          "rom_nvram_corruption",
          "tvs_diode_short",
          "pcb_failure",
          "helium_leak",
          "usb_bridge_failure",
          "external_power_misadventure",
          "capacity_barrier_host",
        ],
      },
      {
        id: "luks_or_filevault",
        label: "LUKS, FileVault, or APFS-encrypted header",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "translator_corruption",
          "encrypted_bridge_keyloss",
          "head_degradation",
          "head_crash",
          "head_crash_drop_event",
          "platter_damage",
          "firmware_sa_corruption",
          "sed_lost_encryption_key",
          "counterfeit_capacity_spoofed",
          "preamp_contact_issue",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "glist_overflow",
          "liquid_corrosion_damage",
          "smart_log_corruption_lockout",
          "plist_corruption_remap_loop",
          "partial_head_failure",
          "thermal_dependent_failure",
          "host_misinterprets_drive",
          "sshd_cache_failure",
          "smr_write_zone_corruption",
          "vcm_driver_ic_failure",
          "scsi_sata_phy_dead",
          "slow_calibration_loop",
          "head_flex_cable_damage",
          "parking_ramp_damage",
          "magnet_dislodged_or_cracked",
          "actuator_coil_open",
          "stiction_seized_motor",
          "spindle_motor_ic_failure",
          "spindle_bearing_wear",
          "rom_nvram_corruption",
          "tvs_diode_short",
          "pcb_failure",
          "helium_leak",
          "usb_bridge_failure",
          "external_power_misadventure",
          "capacity_barrier_host",
        ],
      },
      {
        id: "raid_or_lvm",
        label: "RAID metadata, LVM 'LABELONE', ZFS, or other non-standard structure",
        eliminates: [
          "logical_corruption",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "translator_corruption",
          "head_degradation",
        ],
      },
      {
        id: "uniform_random",
        label: "Uniform high-entropy random data, no recognizable structure anywhere sampled",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "translator_corruption",
          "head_degradation",
          "head_crash",
          "platter_damage",
          "firmware_sa_corruption",
        ],
      },
      {
        id: "all_zeros",
        label: "All zeros despite drive identifying",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "encrypted_bridge_keyloss",
          "host_software_encryption",
          "sed_lost_encryption_key",
        ],
      },
    ],
  },

  {
    id: "modern_host_test",
    phase: "shop",
    question:
      "When connected to a known-modern UEFI host with USB3/SATA3, does the drive report the correct full advertised capacity?",
    detail:
      "Plug into a modern desktop or a UASP-capable USB3 dock. Old hosts cap at 137GB (28-bit LBA), 2.0TB (BIOS), or 2.2TB (MBR partitioning). Some cheap USB-SATA bridges silently truncate above 2TB.",
    risk: "low",
    answers: [
      {
        id: "full_capacity",
        label: "Yes - full capacity on modern host",
        eliminates: ["capacity_barrier_host"],
      },
      {
        id: "still_truncated",
        label: "No - still truncated on modern host",
        eliminates: ["capacity_barrier_host"],
      },
      {
        id: "round_limit",
        label: "Reports a round limit (137GB / 2.0TB / 2.2TB) on the original host but the right size on a modern host",
        eliminates: [
          "hpa_dco_misconfigured",
          "firmware_sa_corruption",
          "translator_corruption",
          "rom_nvram_corruption",
          "head_degradation",
          "platter_damage",
          "counterfeit_capacity_spoofed",
        ],
      },
      {
        id: "no_modern_host",
        label: "Cannot test on a modern host right now",
        eliminates: [],
      },
    ],
  },

  {
    id: "drive_technology",
    phase: "shop",
    question:
      "Looking up the model number, what recording technology / category does this drive belong to?",
    detail:
      "Cross-reference the model on the manufacturer's spec sheet, on Backblaze's drive list, or via smartctl. SMR drives (most WD Red 2-6TB pre-2020, Seagate Archive, WD Blue 2.5\" 1TB+, Toshiba P300 4TB+) and SSHDs (Seagate FireCuda, Toshiba MN/H200) need special handling. Suspiciously-priced marketplace drives may be capacity-spoofed counterfeits.",
    risk: "none",
    answers: [
      {
        id: "regular_cmr",
        label: "Regular CMR HDD - genuine, well-known model",
        eliminates: [
          "sshd_cache_failure",
          "smr_write_zone_corruption",
          "counterfeit_capacity_spoofed",
        ],
      },
      {
        id: "is_sshd",
        label: "SSHD (hybrid HDD with NAND cache)",
        eliminates: [
          "smr_write_zone_corruption",
          "counterfeit_capacity_spoofed",
          "helium_leak",
        ],
      },
      {
        id: "is_smr",
        label: "SMR (shingled magnetic recording) drive",
        eliminates: [
          "sshd_cache_failure",
          "counterfeit_capacity_spoofed",
          "helium_leak",
        ],
      },
      {
        id: "suspect_counterfeit",
        label: "Suspect counterfeit - cheap marketplace, weight wrong, model not on manufacturer's site",
        eliminates: [
          "sshd_cache_failure",
          "smr_write_zone_corruption",
          "helium_leak",
        ],
      },
    ],
  },

  {
    id: "temperature_correlation",
    phase: "shop",
    question:
      "Does the drive's behaviour clearly change with temperature?",
    detail:
      "Cool the drive in a sealed bag in the fridge for 30 minutes (do NOT freezer - condensation), or warm it on a 30-35C seedling mat. Note whether reads succeed or fail in each state. Strong correlation = thermal-window failure.",
    risk: "medium",
    answers: [
      {
        id: "works_cold",
        label: "Works cold, fails warm",
        eliminates: [
          "logical_corruption",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "translator_corruption",
          "rom_nvram_corruption",
          "tvs_diode_short",
          "actuator_coil_open",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "sed_lost_encryption_key",
          "capacity_barrier_host",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "works_warm",
        label: "Works warm, fails cold",
        eliminates: [
          "logical_corruption",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "translator_corruption",
          "rom_nvram_corruption",
          "tvs_diode_short",
          "actuator_coil_open",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "sed_lost_encryption_key",
          "capacity_barrier_host",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "no_correlation",
        label: "No - behaviour is the same regardless of temperature",
        eliminates: ["thermal_dependent_failure"],
      },
    ],
  },

  {
    id: "seek_cadence",
    phase: "shop",
    question:
      "If the drive makes repeated seek/click sounds, what is the rhythm?",
    detail:
      "The cadence distinguishes failure modes that all 'sound like a problem' but are different. Use a phone audio recorder if you need to count - the rate matters.",
    risk: "low",
    answers: [
      {
        id: "rapid_clicking",
        label: "Rapid clicking (1-3 per second, persistent)",
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
          "slow_calibration_loop",
          "parking_ramp_damage",
          "smart_log_corruption_lockout",
          "plist_corruption_remap_loop",
          "host_software_encryption",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "slow_recal",
        label: "Slow rhythmic seek (~1 every 8-30 seconds), drive may eventually ID",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "head_crash",
          "head_crash_drop_event",
          "stiction_seized_motor",
          "actuator_coil_open",
          "spindle_motor_ic_failure",
          "tvs_diode_short",
          "rom_nvram_corruption",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "load_retract_cycle",
        label: "Slow load-retract-load every 1-3 seconds (rhythmic, not rapid)",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "head_crash",
          "actuator_coil_open",
          "spindle_motor_ic_failure",
          "tvs_diode_short",
          "rom_nvram_corruption",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "stiction_seized_motor",
          "vcm_driver_ic_failure",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "irregular_oscillating",
        label: "Irregular: overshoot, oscillation, hunting (not rhythmic at all)",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "actuator_coil_open",
          "spindle_motor_ic_failure",
          "tvs_diode_short",
          "rom_nvram_corruption",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "stiction_seized_motor",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "no_seek_sounds",
        label: "No seek/click sounds at all",
        eliminates: [
          "head_crash",
          "head_crash_drop_event",
          "slow_calibration_loop",
          "parking_ramp_damage",
          "magnet_dislodged_or_cracked",
        ],
      },
    ],
  },

  {
    id: "smart_vs_read",
    phase: "shop",
    question:
      "Does smartctl hang or fail while a raw dd read of the first sector succeeds?",
    detail:
      "Run `dd if=${DEVICE} of=/dev/null bs=512 count=1` first - this skips kernel SMART probing. Then run `smartctl -a ${DEVICE}`. A hang on smartctl while dd works points at log structure corruption.",
    risk: "low",
    answers: [
      {
        id: "smart_hangs_dd_works",
        label: "smartctl hangs/errors but dd succeeds and returns real data",
        eliminates: [
          "logical_corruption",
          "head_crash",
          "stiction_seized_motor",
          "actuator_coil_open",
          "tvs_diode_short",
          "rom_nvram_corruption",
          "translator_corruption",
          "ata_password_locked",
          "spindle_motor_ic_failure",
          "platter_damage",
        ],
      },
      {
        id: "both_work",
        label: "Both succeed normally",
        eliminates: ["smart_log_corruption_lockout"],
      },
      {
        id: "both_fail",
        label: "Both fail",
        eliminates: ["smart_log_corruption_lockout", "logical_corruption"],
      },
    ],
  },

  {
    id: "throughput_uniformity",
    phase: "shop",
    question:
      "When you sample sequential read throughput at multiple offsets (start, 25%, 50%, 75%, end), what's the pattern?",
    detail:
      "Use `dd if=${DEVICE} of=/dev/null bs=1M count=64 skip=N status=progress` at five widely-spaced offsets. Look for: uniform (within 2x at every offset), patchy (some fast, some slow, some fail), or plateau (all uniformly 1-10 MB/s with no SMART events).",
    risk: "medium",
    answers: [
      {
        id: "uniform_full_speed",
        label: "Uniform full platform speed everywhere (80-200+ MB/s)",
        eliminates: [
          "bad_sectors_major",
          "head_degradation",
          "head_crash",
          "platter_damage",
          "plist_corruption_remap_loop",
          "partial_head_failure",
          "glist_overflow",
        ],
      },
      {
        id: "uniform_slow",
        label: "Uniform 1-10 MB/s everywhere with NO SMART event growth",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "head_crash",
          "glist_overflow",
          "platter_damage",
          "translator_corruption",
        ],
      },
      {
        id: "patchy",
        label: "Patchy - some offsets fast, some slow or failing, irregular",
        eliminates: [
          "logical_corruption",
          "plist_corruption_remap_loop",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "capacity_barrier_host",
        ],
      },
      {
        id: "striped_pattern",
        label: "Repeating bands - good band, fail band, good, fail (regular size)",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "translator_corruption",
          "firmware_sa_corruption",
          "glist_overflow",
          "plist_corruption_remap_loop",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
        ],
      },
    ],
  },

  {
    id: "ddrescue_map_pattern",
    phase: "shop",
    question:
      "Looking at a partial ddrescue map (or ddrescueview render), is the bad-region distribution random, or is it a regular repeating stripe?",
    detail:
      "Run a few hours of ddrescue first. Open the mapfile in ddrescueview or count regions with `ddrescuelog -t mapfile`. Stripes with consistent good-band + bad-band sizes mean specific heads are dead - the stripe period equals the per-head allocation size.",
    risk: "medium",
    answers: [
      {
        id: "random_distribution",
        label: "Random, scattered bad sectors with no pattern",
        eliminates: ["partial_head_failure"],
      },
      {
        id: "regular_stripes",
        label: "Regular repeating stripe pattern (same size good/bad bands)",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "translator_corruption",
          "firmware_sa_corruption",
          "glist_overflow",
          "plist_corruption_remap_loop",
        ],
      },
      {
        id: "single_huge_failed_region",
        label: "One large contiguous fail region, rest of drive clean",
        eliminates: ["head_degradation", "translator_corruption"],
      },
    ],
  },

  {
    id: "coil_check",
    phase: "shop",
    question:
      "With the PCB connected, does the head stack make audibly irregular seeks (overshoot, hunt, oscillation) AND does the voice-coil resistance read in the normal 4-20 ohm range?",
    detail:
      "Disconnect the PCB. Measure resistance across the two voice-coil pads on the head-stack contacts (multimeter ohms). Reconnect and listen during spin-up.",
    risk: "medium",
    answers: [
      {
        id: "irregular_with_good_coil",
        label: "Yes - irregular seeks, coil reads 4-20 ohm",
        eliminates: [
          "actuator_coil_open",
          "translator_corruption",
          "rom_nvram_corruption",
          "logical_corruption",
          "spindle_motor_ic_failure",
          "vcm_driver_ic_failure",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "coil_open",
        label: "Coil reads open / infinite resistance",
        eliminates: [
          "logical_corruption",
          "magnet_dislodged_or_cracked",
          "head_degradation",
          "head_crash",
          "stiction_seized_motor",
        ],
      },
      {
        id: "coil_short",
        label: "Coil reads near zero (shorted)",
        eliminates: [
          "logical_corruption",
          "magnet_dislodged_or_cracked",
          "stiction_seized_motor",
        ],
      },
      {
        id: "normal_seeks_good_coil",
        label: "Normal seeks, coil reads good",
        eliminates: ["actuator_coil_open", "magnet_dislodged_or_cracked"],
      },
    ],
  },

  {
    id: "position_thermal_tap",
    phase: "shop",
    question:
      "Does the drive's behaviour momentarily change when you gently tap the lid above the head-cable routing path, or after a thermal cycle (cool from fridge, warm from hairdryer at low setting)?",
    detail:
      "Tap with the eraser end of a pencil over the FPC ribbon's exit point on the HDA. Listen for a momentary change in sound or symptom. A thermal cycle that produces a brief working window also indicates flex-cable / preamp solder marginality.",
    risk: "high",
    answers: [
      {
        id: "tap_changes_behaviour",
        label: "Yes - tapping or thermal cycle produces a brief change",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "ata_password_locked",
          "hpa_dco_misconfigured",
          "translator_corruption",
          "rom_nvram_corruption",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
          "capacity_barrier_host",
          "host_misinterprets_drive",
        ],
      },
      {
        id: "consistent_behaviour",
        label: "No - behaviour is consistent regardless of tapping/thermal",
        eliminates: [
          "head_flex_cable_damage",
          "thermal_dependent_failure",
        ],
      },
    ],
  },

  {
    id: "smr_idle_recovery",
    phase: "shop",
    question:
      "After leaving an SMR drive idle but powered for 4-12 hours immediately after a power-loss-during-write event, has its responsiveness improved?",
    detail:
      "SMR drives reorganise shingled bands as background work. The 'unresponsive after power loss' state often resolves itself given enough idle time. Provide stable power (UPS) and do not interrupt.",
    risk: "low",
    answers: [
      {
        id: "responsive_after_idle",
        label: "Yes - drive is responsive after long idle",
        eliminates: [
          "head_crash",
          "head_degradation",
          "platter_damage",
          "firmware_sa_corruption",
          "stiction_seized_motor",
          "actuator_coil_open",
          "spindle_motor_ic_failure",
        ],
      },
      {
        id: "still_unresponsive",
        label: "No - still unresponsive after 12+ hours idle",
        eliminates: ["smr_write_zone_corruption"],
      },
      {
        id: "not_smr",
        label: "Drive is not SMR / no recent power loss event",
        eliminates: ["smr_write_zone_corruption"],
      },
    ],
  },

  {
    id: "h2testw_verify",
    phase: "shop",
    question:
      "Running h2testw / F3 (write+verify pseudorandom data across the full reported capacity) - does the drive verify clean?",
    detail:
      "DESTRUCTIVE - only run on a drive whose data is already lost or that you suspect is counterfeit. Writes test patterns across the entire LBA range, then reads them back. Counterfeits fail past their genuine size.",
    risk: "high",
    answers: [
      {
        id: "verifies_full",
        label: "Verifies clean across the full reported capacity",
        eliminates: ["counterfeit_capacity_spoofed"],
      },
      {
        id: "fails_past_threshold",
        label: "Verifies up to a threshold (e.g. first 30 GB of a '4 TB' drive), then garbage",
        eliminates: [
          "logical_corruption",
          "bad_sectors_minor",
          "bad_sectors_major",
          "head_degradation",
          "platter_damage",
          "firmware_sa_corruption",
          "translator_corruption",
          "host_software_encryption",
          "encrypted_bridge_keyloss",
        ],
      },
      {
        id: "all_garbage",
        label: "All reads return wrong data immediately",
        eliminates: ["logical_corruption", "bad_sectors_minor"],
      },
      {
        id: "skipped",
        label: "Skipped - data on drive must be preserved",
        eliminates: [],
      },
    ],
  },
];

export const testById = Object.fromEntries(tests.map((t) => [t.id, t]));
