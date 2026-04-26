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
      "On a helium-filled drive (8TB+ enterprise typical), the hermetic seal has failed. As helium escapes, head fly-height collapses and every surface starts erroring simultaneously. Not field-recoverable — image urgently.",
    severity: "lab-cleanroom",
    phase: "lab",
  },
];

export const hypothesisById = Object.fromEntries(
  hypotheses.map((h) => [h.id, h]),
);
