// Each hypothesis is a possible state the drive could be in.
// `severity` drives the recommendation surface:
//   diy           — recoverable by the user / shop with software
//   shop          — recoverable by a shop with cloning hardware
//   lab           — needs a professional data recovery lab
//   lab-cleanroom — needs cleanroom (head replacement, platter work)
//   unrecoverable — platter damage, customer should be told to abort
//
// `phase` controls which mode shows it:
//   shop  — visible during shop-level triage
//   lab   — only relevant once it's at a professional lab
//   both  — visible everywhere
export const hypotheses = [
  {
    id: "logical_corruption",
    name: "Logical / filesystem corruption",
    description:
      "Drive hardware is healthy but the filesystem is damaged. Accidental format, partition table loss, deleted files.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "bad_sectors_minor",
    name: "Minor bad sectors, heads intact",
    description:
      "A handful of unreadable sectors. Drive otherwise functional. Cloning recovers nearly everything.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "bad_sectors_major",
    name: "Extensive bad sectors",
    description:
      "Large unreadable regions. Cloning is slow and partial. Heads may be degrading.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "pcb_failure",
    name: "PCB (controller board) failure",
    description:
      "The circuit board is dead — often from a power surge. Drive does not spin or is not detected. Often fixable by swapping PCB and migrating the ROM/adaptives.",
    severity: "lab",
    phase: "both",
  },
  {
    id: "preamp_contact_issue",
    name: "Pre-amp contact issue",
    description:
      "Dirty or oxidised contacts between the PCB and the head stack. Cleaning the contacts may restore the drive.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "firmware_sa_corruption",
    name: "Firmware / Service Area corruption",
    description:
      "Drive spins but reports wrong ID, wrong capacity, or fails S.M.A.R.T. The service area on the platter is damaged. Needs PC-3000 or equivalent.",
    severity: "lab",
    phase: "both",
  },
  {
    id: "head_degradation",
    name: "Degraded read/write heads",
    description:
      "Heads are weakening — drive IDs but reads are unreliable, S.M.A.R.T. flags pending sectors, cloning fails partway. High risk of progressing to head crash.",
    severity: "lab-cleanroom",
    phase: "both",
  },
  {
    id: "head_crash",
    name: "Head crash / failed heads",
    description:
      "One or more heads are physically damaged. Drive clicks, beeps, or makes a repetitive seek noise. Powering on risks platter damage.",
    severity: "lab-cleanroom",
    phase: "both",
  },
  {
    id: "stiction_seized_motor",
    name: "Stiction or seized spindle",
    description:
      "Drive does not spin up at all — heads stuck to platter or motor bearing seized. Cleanroom job.",
    severity: "lab-cleanroom",
    phase: "both",
  },
  {
    id: "platter_damage",
    name: "Platter / media damage",
    description:
      "Visible scratches or oxidation on the platters. Recovery is partial at best, often impossible. Customer should be advised accordingly.",
    severity: "unrecoverable",
    phase: "lab",
  },

  // --- Additional electronic / firmware modes ---
  {
    id: "tvs_diode_short",
    name: "TVS diode shorted (over-voltage protection blown)",
    description:
      "A power surge or wrong adapter shorted one or both protection diodes on the PCB. Drive is completely dead but data on the platters is untouched. Removing or replacing the shorted diode usually restores it.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "ata_password_locked",
    name: "ATA security password lock",
    description:
      "Drive is healthy but firmware refuses I/O until the user or master password is presented. Typical after stolen-laptop recovery, BIOS auto-lock, or forgotten passwords.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "hpa_dco_misconfigured",
    name: "HPA or DCO hides capacity",
    description:
      "A Host Protected Area or Device Configuration Overlay is hiding part of the drive. The 'missing' sectors are intact and accessible once HPA/DCO is cleared.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "translator_corruption",
    name: "Translator (LBA-to-PBA) corruption",
    description:
      "Drive IDs correctly but every read returns zeros, garbage, or I/O errors. The translator that maps logical sectors to physical locations on the platter is damaged. Distinct from broader SA corruption — needs PC-3000 to regenerate.",
    severity: "lab",
    phase: "lab",
  },
  {
    id: "glist_overflow",
    name: "G-list saturated (defect list full)",
    description:
      "Reallocated_Sector_Ct is at or near the vendor maximum and pending sectors keep climbing. Drive can no longer reallocate — every new defect causes a long retry/timeout. Image once, fast, then stop.",
    severity: "shop",
    phase: "both",
  },
  {
    id: "spindle_motor_ic_failure",
    name: "Spindle motor driver IC failure",
    description:
      "PCB powers up but the motor driver chip is dead — drive is silent at power-on with no current spike. Distinct from stiction (would hum or whine) and from total PCB death.",
    severity: "shop",
    phase: "both",
  },
  {
    id: "spindle_bearing_wear",
    name: "Spindle bearing wear / FDB failure",
    description:
      "Drive spins but is audibly louder (whine, grinding, warble), throughput is poor, errors rise as it warms. Bearing has lost lubricant or developed wobble — head fly-height is no longer reliable.",
    severity: "lab-cleanroom",
    phase: "lab",
  },
  {
    id: "actuator_coil_open",
    name: "Voice-coil actuator open / shorted",
    description:
      "Drive spins to full RPM and stays there silently — no seek clicks, no head movement. The coil that moves the head stack is open or shorted (broken flex, burned coil).",
    severity: "lab-cleanroom",
    phase: "lab",
  },
  {
    id: "rom_nvram_corruption",
    name: "PCB ROM / NVRAM corruption",
    description:
      "Drive isn't detected even after a known-good donor PCB. The serial flash on the PCB (which holds the bootloader and adaptive parameters) is corrupt. Surfaces only after a PCB swap fails — which is why we test for it that way.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "liquid_corrosion_damage",
    name: "Liquid ingress / corrosion",
    description:
      "Visible residue or green/white corrosion on the PCB or near the breather hole. Drive may run intermittently or fail as it warms up. PCB-side cleaning is DIY-tractable; if the HDA was breached, it's a cleanroom job.",
    severity: "shop",
    phase: "both",
  },
  {
    id: "head_crash_drop_event",
    name: "Drop / sudden mechanical shock event",
    description:
      "A known drop or impact while powered drove heads into platters. Differs from gradual head_crash because there's a triggering event and often loose debris. Every additional power-on grinds debris into the surfaces.",
    severity: "lab-cleanroom",
    phase: "both",
  },
  {
    id: "helium_leak",
    name: "Helium leak (sealed enterprise drives)",
    description:
      "On a helium-filled drive (8TB+ enterprise typical), the hermetic seal has failed. As helium escapes, head fly-height collapses and every surface starts erroring simultaneously. Not field-recoverable - image urgently.",
    severity: "lab-cleanroom",
    phase: "lab",
  },

  // --- Additional electronic / firmware modes (round 2) ---
  {
    id: "vcm_driver_ic_failure",
    name: "VCM driver section dead (combo chip partial failure)",
    description:
      "On modern PCBs the spindle and voice-coil drive share one combo chip. When only the VCM half dies, the spindle reaches full RPM and the heads never load - silent after spin-up, no seek, no click. Distinct from a dead coil (actuator_coil_open) because a matched donor PCB swap fixes this; the coil itself is fine.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "scsi_sata_phy_dead",
    name: "SATA/SAS interface PHY dead (drive alive on serial)",
    description:
      "Drive spins, seeks, idles normally, and replies on the diagnostic UART pads, but the host sees nothing on the SATA bus. The interface bridge inside the controller has failed while the rest of the drive is healthy - common after a partial surge that the TVS handled imperfectly.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "slow_calibration_loop",
    name: "Endless calibration / recalibration loop",
    description:
      "Drive spins to full RPM and emits a slow rhythmic seek (~1 every 8-30 seconds), never IDs to BIOS or only IDs after a 30-90 second delay. Firmware is stuck retrying a thermal or servo recalibration on a marginal head. Rhythm is the giveaway - faster than normal idle, much slower than head-crash clicking.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "smart_log_corruption_lockout",
    name: "SMART/log structure corruption causing identify hang",
    description:
      "Reading SMART (or, sometimes, the OS's IDENTIFY DEVICE probe) hangs the drive for 30+ seconds and may cause BIOS to drop the device. The summary or self-test log on the platter has corrupt headers. User data area is fine - clone without smartctl probing and the data comes back.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "plist_corruption_remap_loop",
    name: "P-list corruption forcing G-list remap on every read",
    description:
      "Factory primary defect list is damaged. Reads of ex-defective sectors take the long G-list path or fail outright, even though the media is healthy. Symptom: uniform 1-5 MB/s throughput across the whole LBA range with zero SMART growth. Often misdiagnosed as failing heads, leading to unnecessary HSA work.",
    severity: "lab",
    phase: "shop",
  },

  // --- Additional mechanical / HDA modes (round 2) ---
  {
    id: "head_flex_cable_damage",
    name: "Head FPC / flex cable damage between HSA and PCB",
    description:
      "The orange/brown ribbon carrying preamp signals from the head stack to the PCB connector is cracked, kinked, or has lost trace continuity. Behaviour changes with actuator position or temperature; tapping the lid near the cable routing path produces momentary symptom changes. Distinct from preamp_contact_issue (external pads) - this is the cable itself.",
    severity: "lab-cleanroom",
    phase: "lab",
  },
  {
    id: "parking_ramp_damage",
    name: "Parking ramp broken or dislodged",
    description:
      "The plastic ramp that holds the heads off the platter at rest is cracked or displaced. Drive performs a slow rhythmic load-retract-load cycle (every 1-3 seconds) instead of clicking rapidly or going quiet. Common after a drop while powered off or after high Load_Cycle_Count.",
    severity: "lab-cleanroom",
    phase: "lab",
  },
  {
    id: "partial_head_failure",
    name: "Partial head map (some heads working, some failed)",
    description:
      "On a multi-platter drive one or more heads have failed but others read normally. ddrescue maps show a regular striped pattern - good band, fail band, repeating. Rescue strategy is fundamentally different from total head failure - image around dead heads first, decide on HSA swap afterwards.",
    severity: "lab",
    phase: "both",
  },
  {
    id: "magnet_dislodged_or_cracked",
    name: "Voice coil magnet cracked or dislodged",
    description:
      "The neodymium magnet driving the actuator is cracked from a drop or has come loose from its yoke. Heads seek erratically (overshoot, oscillate, hunt) but the coil itself tests good (4-20 ohms). Distinct from actuator_coil_open (no movement at all) and from head_crash (movement with platter contact).",
    severity: "lab-cleanroom",
    phase: "lab",
  },
  {
    id: "thermal_dependent_failure",
    name: "Thermal-dependent failure (works only when cold or only when warm)",
    description:
      "Drive works inside a narrow temperature window. Cold-fail: lubricants viscous, contracted preamp solder joints, expanded clearances. Warm-fail: marginal preamp overheats, fly-height collapses. Often presents as 'fine for 10 minutes then errors climb' or 'IDs only after warm-up'. Triggered by hot-car / attic storage / fire-adjacent scenarios as well as gradual aging.",
    severity: "shop",
    phase: "shop",
  },

  // --- Environmental / interface / edge-case modes (round 2) ---
  {
    id: "usb_bridge_failure",
    name: "USB-SATA bridge failure (drive is fine, enclosure is dead)",
    description:
      "The USB-to-SATA bridge inside an external enclosure has failed. The internal SATA drive is almost always healthy and IDs perfectly when shucked and connected directly to a desktop SATA port. Highest-leverage diagnostic step for any external drive failure.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "encrypted_bridge_keyloss",
    name: "Enclosure-bound hardware encryption with lost bridge",
    description:
      "WD MyBook/Easystore/Passport, Seagate Backup Plus and similar enclosures encrypt the drive transparently with an AES key burned into the bridge's serial flash. Shucked drive reads as uniform random noise. If the original bridge died and was discarded, the data is mathematically gone - if the bridge or a same-firmware donor exists, key transplant is feasible.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "host_software_encryption",
    name: "Host-side encryption (BitLocker/FileVault/LUKS) with lost key",
    description:
      "Drive is healthy but every sector is BitLocker, FileVault2, LUKS, or VeraCrypt. Without the recovery key/passphrase/TPM unlock the data is mathematically inaccessible regardless of recovery effort. Often misdiagnosed as filesystem corruption because users forget Windows 11 turns Device Encryption on automatically.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "capacity_barrier_host",
    name: "Host capacity barrier (28-bit LBA / 2.2TB MBR / old BIOS)",
    description:
      "Drive is fine; the host is the bottleneck. 137 GB cap (28-bit LBA, pre-2003 ATA), 2.2 TB cap (MBR), or older BIOS truncating to 2 TB. Some USB-SATA bridges silently truncate above 2 TB. Distinct from HPA/DCO because the drive itself reports correct capacity to a modern host.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "external_power_misadventure",
    name: "Wrong-polarity adapter or insufficient USB power",
    description:
      "External 3.5\" drives killed by the wrong 12V adapter (different drive, router PSU, reversed polarity). Bus-powered 2.5\" drives spinning down on a passive USB hub or low-current laptop port. Often the bridge takes the hit before the drive does, so shucking and direct SATA still works.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "host_misinterprets_drive",
    name: "Host can't read the drive's format (RAID/4Kn/foreign GPT/Apple)",
    description:
      "Drive is mechanically perfect but the host doesn't understand the on-disk layout. RAID member with proprietary metadata, 4Kn drive on a 512n-only host, GPT from another OS that Windows wants to 'initialize', Apple Fusion HDD half whose SSD half is gone, HFS+ Time Machine on Windows. Almost always misdiagnosed as 'drive needs formatting'.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "sshd_cache_failure",
    name: "SSHD (hybrid) NAND cache failure",
    description:
      "Solid-state hybrid drives (Seagate FireCuda, Toshiba/WD MN-series) pair an HDD with a small NAND cache. When the NAND wears out or its controller fails the drive reports I/O errors or hangs - even though the magnetic media is fine. Image fast-and-cold before the controller marks itself read-only; rotating-media data recovers normally afterwards.",
    severity: "shop",
    phase: "shop",
  },
  {
    id: "smr_write_zone_corruption",
    name: "SMR (shingled) write-zone corruption after power loss",
    description:
      "SMR drives (most WD Red 2-6TB pre-2020, Seagate Archive, many WD Blue/Toshiba P300 4-6TB) write in overlapping bands via a CMR persistent cache. Power loss during a flush leaves bands partially rewritten; on next power-up the drive does hours of internal housekeeping. Often misdiagnosed as bad sectors.",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "counterfeit_capacity_spoofed",
    name: "Counterfeit drive (firmware lies about capacity)",
    description:
      "Sketchy-marketplace drives contain a small genuine drive flashed with firmware reporting a much larger capacity. Writes wrap or land at non-existent addresses. User notices when files come back as garbage or when filling past real capacity. Distinct from HPA/DCO (which shrinks, not grows, and the underlying drive is genuine).",
    severity: "diy",
    phase: "shop",
  },
  {
    id: "sed_lost_encryption_key",
    name: "SED / Opal self-encrypting drive with lost DEK",
    description:
      "Most laptop drives 2011+ implement hardware self-encryption. The DEK is wrapped by a user authentication key. If the DEK has been cryptographically erased (PSID revert, max-mode security erase, forgotten Opal password with no backup), the platters contain unrecoverable ciphertext. Distinct from ata_password_locked - that's a lock that can be unlocked; this is genuine cryptographic loss.",
    severity: "unrecoverable",
    phase: "shop",
  },
];

export const hypothesisById = Object.fromEntries(
  hypotheses.map((h) => [h.id, h]),
);
