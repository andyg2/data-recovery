// Actions are recommendations surfaced once the hypothesis set narrows.
// `triggers` lists hypothesis IDs — when ALL remaining hypotheses are in
// this set, the action is shown. Severity controls visual weight.
export const actions = [
  {
    id: "recover_logical",
    label: "Run filesystem recovery on a clone",
    severity: "diy",
    triggers: ["logical_corruption", "bad_sectors_minor"],
    detail:
      "Image the drive first with ddrescue, then point R-Studio, UFS Explorer, or GetDataBack at the clone. Never scan the original.",
  },
  {
    id: "clone_ddrescue",
    label: "Clone with ddrescue, then recover from the image",
    severity: "diy",
    triggers: ["bad_sectors_minor", "bad_sectors_major"],
    detail:
      "Use ddrescue on Linux with a logfile so you can resume. Skip bad regions on the first pass, retry them later.",
  },
  {
    id: "clean_preamp",
    label: "Clean the pre-amp contacts and re-seat the PCB",
    severity: "shop",
    triggers: ["preamp_contact_issue"],
    detail:
      "Isopropyl alcohol on a lint-free cloth, gentle wipe with a pencil eraser if oxidised. Reseat and retest in BIOS.",
  },
  {
    id: "pcb_swap",
    label: "Source a donor PCB and migrate the ROM",
    severity: "shop",
    triggers: ["pcb_failure"],
    detail:
      "Match the PCB by part number AND revision. Transfer the ROM chip (or read adaptives with a programmer) — a raw board swap rarely works on modern drives.",
    playbook: "pcb_swap_with_rom_transfer",
  },
  {
    id: "send_to_lab",
    label: "Send to a professional data recovery lab",
    severity: "lab",
    triggers: [
      "head_crash",
      "head_degradation",
      "stiction_seized_motor",
      "firmware_sa_corruption",
    ],
    detail:
      "Stop powering it on. Bag it, document the symptoms, and ship to a reputable lab with a Class 100 cleanroom.",
  },
  {
    id: "abort_recovery",
    label: "Recommend the customer abort recovery",
    severity: "unrecoverable",
    triggers: ["platter_damage"],
    detail:
      "Visible platter damage means partial recovery at best. Set expectations honestly before charging for further work.",
  },

  // --- Additional actions for the expanded hypothesis set ---
  {
    id: "replace_tvs",
    label: "Remove or replace the shorted TVS diode",
    severity: "diy",
    triggers: ["tvs_diode_short"],
    detail:
      "Lift the shorted TVS off the PCB with hot air or two soldering irons. Drive will run without it, but reimage immediately - your only surge protection is now gone. Replace with SMBJ5.0A (5V) or SMBJ12A (12V) after recovery.",
    playbook: "tvs_diode_diagnosis_and_replacement",
  },
  {
    id: "unlock_ata_password",
    label: "Unlock the ATA security password",
    severity: "diy",
    triggers: ["ata_password_locked"],
    detail:
      "Try the user's known passwords first via `hdparm --user-master u --security-unlock`. If unknown, try the vendor master password (Seagate: 32 spaces, WD: blank or repeating WDC). Watch out for SECURITY ERASE on max-mode drives - read your model's behaviour before guessing.",
    playbook: "ata_password_unlock",
  },
  {
    id: "remove_hpa_dco",
    label: "Remove HPA / DCO to restore advertised capacity",
    severity: "diy",
    triggers: ["hpa_dco_misconfigured"],
    detail:
      "Image the visible portion first. Then `hdparm -N pYYYYY ${DEVICE}` (with native max sectors) - omit `p` for non-volatile. For DCO use `hdparm --dco-restore`. Re-image at the new full size; previously hidden sectors may contain the data you want.",
    playbook: "hpa_dco_removal",
  },
  {
    id: "transfer_rom",
    label: "Transfer the original ROM chip to the donor PCB",
    severity: "shop",
    triggers: ["rom_nvram_corruption"],
    detail:
      "Read the original ROM with a CH341A programmer (8-pin SOIC clip), erase the donor PCB's flash, write the patient ROM, verify. The drive should now ID. Read 3 times before writing - bit-rot can also be on the source.",
    playbook: "pcb_swap_with_rom_transfer",
  },
  {
    id: "clean_pcb_corrosion",
    label: "Clean the corroded PCB and contacts",
    severity: "shop",
    triggers: ["liquid_corrosion_damage"],
    detail:
      "Remove the PCB. Soak in 99% IPA for 30s and brush corrosion off the contacts and traces with a soft toothbrush. Ultrasonic clean if you have one. Inspect under magnification before reassembly. If corrosion has reached inside the HDA, escalate to a cleanroom.",
  },
  {
    id: "image_once_then_stop",
    label: "Single fast clone, then stop powering the drive",
    severity: "shop",
    triggers: [
      "glist_overflow",
      "head_crash_drop_event",
      "helium_leak",
    ],
    detail:
      "These modes get progressively worse with every spin. Run ddrescue with `--no-scrape -d -n` for one fast pass. No retries, no second attempts on the original. Recover from the image afterwards.",
  },
  {
    id: "lab_pc3000",
    label: "Send to a lab with PC-3000 for translator/firmware regeneration",
    severity: "lab",
    triggers: [
      "translator_corruption",
      "firmware_sa_corruption",
    ],
    detail:
      "Translator regeneration requires PC-3000 or MRT with the family-specific module. Not DIY at present. Bag the drive, document the symptoms, ship.",
  },
  {
    id: "donor_hsa_swap",
    label: "Donor head-stack swap (cleanroom-equivalent)",
    severity: "lab-cleanroom",
    triggers: [
      "head_crash",
      "head_degradation",
      "actuator_coil_open",
      "spindle_bearing_wear",
    ],
    detail:
      "Source a family-matched donor (model + firmware + site code). Park heads with a comb, swap the HSA in a HEPA-filtered environment. See the full repair playbook for parts, tools, and step-by-step.",
    playbook: "head_stack_assembly_swap",
  },
  {
    id: "inspect_platters",
    label: "Visually inspect the platters before deciding",
    severity: "shop",
    triggers: ["platter_damage", "head_crash", "head_crash_drop_event"],
    detail:
      "One-shot diagnostic. Open the drive in a dust-mitigated space, shine a low-angle light across the platters, look for concentric scratches, rings, or debris. Once opened, treat as single-use unless you have a real cleanroom.",
    playbook: "platter_visual_inspection",
  },
  {
    id: "stiction_release",
    label: "Sharp rotational twist to break stiction",
    severity: "diy",
    triggers: ["stiction_seized_motor"],
    detail:
      "Pre-2008 drives only. Disconnect power, hold the drive flat, single sharp ~30° clockwise-then-counter twist in the plane of the platters. Power on immediately and image without a second cold-start. Modern ramp-load drives do not get stiction - this procedure will damage them.",
    playbook: "stiction_freeing",
  },
  {
    id: "swap_motor_pcb",
    label: "Donor PCB swap (motor controller IC failed)",
    severity: "shop",
    triggers: ["spindle_motor_ic_failure"],
    detail:
      "Same procedure as a regular PCB swap: matched donor + ROM transfer. The motor driver IC is on the PCB, so a board swap restores spin even when stiction and PCB-rail tests come up clean.",
    playbook: "pcb_swap_with_rom_transfer",
  },
];
