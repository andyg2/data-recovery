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

  // --- Round 2 actions ---

  {
    id: "shuck_external",
    label: "Shuck the external enclosure and connect the bare drive directly to SATA",
    severity: "diy",
    triggers: ["usb_bridge_failure", "external_power_misadventure"],
    detail:
      "Pry open the plastic enclosure with a spudger, remove the drive from its USB-SATA bridge, and plug it directly into a desktop SATA port. About 80% of 'my external drive died' cases are a dead bridge - the drive itself is fine. KEEP the original bridge in case the drive is hardware-encrypted (WD MyBook, Seagate Backup Plus): the AES key lives in the bridge's serial flash.",
    playbook: "external_drive_shuck",
  },
  {
    id: "transplant_bridge_flash",
    label: "Transplant the encryption-bridge serial flash to a same-firmware donor",
    severity: "shop",
    triggers: ["encrypted_bridge_keyloss"],
    detail:
      "WD/Seagate self-encrypting enclosures store the AES key in the bridge PCB's serial flash. Read the flash with a CH341A clip (drive does not need to be powered), write to a same-firmware donor bridge, and reuse the donor for decryption. If the original bridge is destroyed AND no same-firmware donor is findable, the data is mathematically lost.",
    playbook: "encrypted_bridge_key_recovery",
  },
  {
    id: "find_encryption_key",
    label: "Recover the host-side encryption key (BitLocker/FileVault/LUKS)",
    severity: "diy",
    triggers: ["host_software_encryption"],
    detail:
      "Check Microsoft account at account.microsoft.com/devices/recoverykey for BitLocker. Apple ID iCloud has FileVault recovery keys. AD domains escrow BitLocker centrally. LUKS users may have a keyfile on a backup. Once you have it, dislocker (Linux) or native OS unlock mounts the volume normally. Without the key, the data is unrecoverable - no lab can break AES-256.",
    playbook: "encryption_key_recovery",
  },
  {
    id: "use_modern_host",
    label: "Move the drive to a modern UEFI host with a current SATA/USB3 controller",
    severity: "diy",
    triggers: ["capacity_barrier_host"],
    detail:
      "If the drive reports 137GB / 2.0TB / 2.2TB on the original host but shows full capacity on a modern desktop or USB3 dock, the failure is in the host - not the drive. Move the drive permanently to a host that can address its full size, and use GPT partitioning rather than MBR.",
  },
  {
    id: "fix_external_power",
    label: "Replace the adapter or use a powered USB hub / Y-cable",
    severity: "diy",
    triggers: ["external_power_misadventure"],
    detail:
      "Verify the barrel-jack adapter is the correct voltage AND polarity (multimeter). Most 3.5\" external drives need 12V 2A center-positive 5.5x2.5mm. For 2.5\" bus-powered drives use a powered USB3 hub, a Y-cable into two ports, or a port that can supply at least 900mA. If the original wrong adapter killed the bridge, shuck and connect via SATA.",
  },
  {
    id: "platform_shift_recognise_format",
    label: "Move the drive to a host that understands its on-disk format",
    severity: "diy",
    triggers: ["host_misinterprets_drive"],
    detail:
      "Boot a Linux live USB (Ubuntu / SystemRescue) for RAID member assembly via mdadm/lvm/zfs. Apple Fusion / APFS-encrypted volumes need a Mac. HFS+ Time Machine on Windows needs HFSExplorer or paragonfs. CRITICALLY: do NOT click 'Initialize disk' / 'You need to format this' in Windows - that overwrites the partition table.",
    playbook: "format_recognition",
  },
  {
    id: "smr_idle_then_image",
    label: "Power on, leave idle 4-12 hours on a UPS, then image",
    severity: "diy",
    triggers: ["smr_write_zone_corruption"],
    detail:
      "SMR drives need uninterrupted idle time after a power-loss-during-write to reorganise shingled bands. Power on, do nothing, wait. Use a UPS so a second power loss doesn't restart the cycle. Once responsive, ddrescue to a target drive in one continuous session.",
  },
  {
    id: "sshd_cold_image",
    label: "Image the SSHD fast-and-cold before the cache controller locks out",
    severity: "shop",
    triggers: ["sshd_cache_failure"],
    detail:
      "ddrescue --no-scrape -d -n on the first pass. SSHD cache controllers can decide to refuse all I/O once they detect NAND failure. Get the rotating-media data off in one pass; do not retry on the original.",
  },
  {
    id: "verify_counterfeit",
    label: "Confirm counterfeit with h2testw / F3, partition to genuine size",
    severity: "diy",
    triggers: ["counterfeit_capacity_spoofed"],
    detail:
      "h2testw (Windows) or f3write/f3read (Linux/macOS) writes pseudorandom data across the full reported capacity then verifies. If verification fails past a threshold, partition the drive to the verified size only and use the smaller (real) capacity. Data written past the boundary is gone - no recovery is possible because it was never stored.",
    playbook: "counterfeit_diagnosis",
  },
  {
    id: "set_expectations_sed",
    label: "Stop spending - SED with lost DEK is unrecoverable",
    severity: "unrecoverable",
    triggers: ["sed_lost_encryption_key"],
    detail:
      "Hardware AES-256 self-encryption with a lost or cryptographically-erased DEK is mathematically unrecoverable. No lab can break it. Confirm with vendor SED utility (Samsung Magician, WD Security, Seagate Toolkit, sedutil-cli). The DIY value is preventing further spend; offer the user one last check of password managers and vendor key escrow before closing the case.",
  },
  {
    id: "clone_skip_smart",
    label: "Clone without SMART probing (bypass the log corruption)",
    severity: "diy",
    triggers: ["smart_log_corruption_lockout"],
    detail:
      "Use ddrescue with --idirect to skip kernel SMART probes, OR boot a minimal Linux that does not auto-query SMART (no smartd, no UDisks). The user data area is fine - the SMART log structure is what's hanging the drive. Image first, worry about the SMART repair (which needs PC-3000) only if the drive will be reused.",
  },
  {
    id: "thermal_window_clone",
    label: "Image the drive in its working temperature window",
    severity: "diy",
    triggers: ["thermal_dependent_failure"],
    detail:
      "If cold-works/warm-fails: insulated container with ice packs (NOT freezer - condensation), drive in a sealed bag with a desiccant pouch. Run ddrescue and refresh cooling every 30 minutes. If warm-works/cold-fails: 30-35C seedling mat with a thermostat, never higher. Either way, image in one session - thermal cycles are stressful for marginal hardware.",
    playbook: "thermal_window_imaging",
  },
  {
    id: "image_then_partial_recover",
    label: "Image the working heads first; decide on HSA swap for the dead surfaces afterwards",
    severity: "shop",
    triggers: ["partial_head_failure"],
    detail:
      "ddrescue with stripe-aware filtering: pass --skip-size to jump past entire dead-head bands fast. Modern Linux ddrescue + ddrescueview lets you visualise the stripe. Recover all the working-head data with no cleanroom; only escalate to donor HSA swap if the customer specifically needs the dead-head surfaces.",
    playbook: "partial_head_imaging",
  },
  {
    id: "lab_translator_or_plist",
    label: "Send to a lab for P-list / translator regeneration on PC-3000",
    severity: "lab",
    triggers: ["plist_corruption_remap_loop"],
    detail:
      "Uniform 1-5 MB/s with no SMART growth means the P-list is damaged. Field-imaging is possible but takes weeks per terabyte. PC-3000 with the family-specific P-list rebuild module is the actual fix. Do NOT attempt HSA swap - the heads are fine.",
  },
  {
    id: "donor_pcb_for_vcm",
    label: "Donor PCB swap (VCM driver section dead, coil is fine)",
    severity: "shop",
    triggers: ["vcm_driver_ic_failure"],
    detail:
      "Same procedure as any other donor PCB swap with ROM transfer - the VCM driver lives on the PCB combo chip. Confirm the coil resistance is healthy first (4-20 ohm), otherwise it's actuator_coil_open and a PCB swap will not help.",
    playbook: "pcb_swap_with_rom_transfer",
  },
  {
    id: "donor_pcb_for_phy",
    label: "Donor PCB swap (SATA PHY dead, drive alive on serial)",
    severity: "shop",
    triggers: ["scsi_sata_phy_dead"],
    detail:
      "Confirmed via UART boot banner first (drive is healthy, just can't talk SATA). Standard donor PCB + ROM transfer restores the host interface.",
    playbook: "pcb_swap_with_rom_transfer",
  },
  {
    id: "single_pass_calibration_loop",
    label: "Single careful clone attempt around the calibration loop",
    severity: "shop",
    triggers: ["slow_calibration_loop"],
    detail:
      "ddrescue with -d -n --skip-size=64MiB --no-trim --no-scrape. Power-cycle attempts get a clean ID some fraction of the time; use a UART terminal to abort the recal manually if you have one. Do not retry on the original - drive may progress to head_crash. Active cooling helps if the recal is thermally driven.",
  },
  {
    id: "donor_ramp_swap",
    label: "Donor parking ramp swap (heads still parked correctly)",
    severity: "shop",
    triggers: ["parking_ramp_damage"],
    detail:
      "If the heads have NOT fallen onto the platter, the ramp can be swapped from a same-family donor in a Tier 2 dust-mitigated environment. The platters and HSA pivot are not disturbed. If heads have already contacted the platter, this becomes a full HSA swap.",
    playbook: "parking_ramp_swap",
  },
  {
    id: "donor_magnet_swap",
    label: "Donor top-magnet assembly swap (cracked or dislodged)",
    severity: "shop",
    triggers: ["magnet_dislodged_or_cracked"],
    detail:
      "Two T6/T8 screws release the top magnet plate. Use a thick plastic wedge to break the magnetic clamp - do NOT use bare hands, the pull is dangerous. Inspect platters afterwards: any neodymium fragments mean the recovery has shifted to platter contamination territory.",
    playbook: "donor_magnet_swap",
  },
  {
    id: "flex_cable_inspection",
    label: "Inspect (and possibly bridge) the head FPC cable",
    severity: "lab-cleanroom",
    triggers: ["head_flex_cable_damage"],
    detail:
      "FPC repair under microscopy is feasible for a single broken trace using conductive silver paint or hair-thin solder. Most cases need a full HSA swap because the cable is bonded into the head stack at one end. Confirm with the position-tap test before opening.",
    playbook: "head_stack_assembly_swap",
  },
];
