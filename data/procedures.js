// Per-test procedures: prerequisites, OS-specific commands, expected output,
// interpretation. The UI substitutes ${VAR} placeholders from the drive
// specifics store before rendering and copy-to-clipboard.
//
// Available variables:
//   ${DEVICE}      OS-specific device path (\\.\PhysicalDriveN, /dev/sdX, /dev/diskN)
//   ${CLONE_DEST}  destination path for the clone image
//   ${LOGFILE}     ddrescue logfile / map file path
//   ${MODEL}       drive model (informational, used in notes)
//   ${SERIAL}      drive serial (informational)
//   ${CAPACITY}    drive capacity (informational)
//   ${IMAGE_PATH}  path of mounted/attached clone for FS scanning
//
// `requires` on a step lists the variables that step needs filled before it
// can run. The UI surfaces a "fill in X" hint when a required var is empty.
//
// Stubs are intentional. Fill in commands as you validate them in your shop.

export const procedures = {
  // -------------------------------------------------------------------------
  sounds: {
    prerequisites: [
      "Drive is on a stable bench, free of vibration.",
      "Use a SATA-to-USB adapter or known-good bench PSU - never spin a suspect drive on a flaky power supply.",
      "Have a phone or stethoscope ready to listen close to the casing.",
    ],
    os: {
      windows: {
        shell: "n/a - this is a listen test",
        tools: [],
        steps: [
          {
            label:
              "Power the drive briefly (no more than 5 seconds) and listen.",
            command: "# No command - listen for spin-up, click, beep, grind",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "n/a - listen test",
        tools: [],
        steps: [
          {
            label: "Power the drive briefly and listen.",
            command: "# No command - listen for spin-up, click, beep, grind",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "n/a - listen test",
        tools: [],
        steps: [
          {
            label: "Power the drive briefly and listen.",
            command: "# No command - listen for spin-up, click, beep, grind",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      'A healthy 3.5" drive spins up smoothly with one short seek, then goes near-silent. A 2.5" drive is even quieter.',
    interpretation:
      "Clicking / beeping / grinding = mechanical. Silent = motor or PCB. Normal sound = continue with electronic tests.",
  },

  // -------------------------------------------------------------------------
  bios_id: {
    prerequisites: [
      "Drive connected directly to a SATA port (avoid USB bridges - they hide the real ID).",
      "Boot machine into BIOS/UEFI setup.",
    ],
    os: {
      windows: {
        shell: "PowerShell (Admin) - alternative to BIOS check",
        tools: ["PowerShell"],
        steps: [
          {
            label: "List physical drives with model and size from the OS.",
            command:
              "Get-PhysicalDisk | Select-Object DeviceId,FriendlyName,SerialNumber,Size,HealthStatus",
            requires: [],
            outputType: "drive_list",
          },
          {
            label:
              "Show full detail for every drive - capture the output below, then click the suspect drive to populate the variables.",
            command:
              "Get-PhysicalDisk | Format-List DeviceId,FriendlyName,SerialNumber,Size,MediaType,BusType,SpindleSpeed,FirmwareVersion,HealthStatus",
            requires: [],
            outputType: "drive_list",
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["util-linux (lsblk)", "hdparm"],
        steps: [
          {
            label: "List block devices with model, serial, size.",
            command: "lsblk -o NAME,MODEL,SERIAL,SIZE,TYPE,TRAN",
            requires: [],
            outputType: "drive_list",
          },
          {
            label: "Query the drive directly.",
            command: "sudo hdparm -I ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "drive_info",
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: ["diskutil", "smartmontools (brew install smartmontools)"],
        steps: [
          {
            label: "List all attached disks.",
            command: "diskutil list",
            requires: [],
            outputType: "drive_list",
          },
          {
            label: "Show identification info for the drive.",
            command: "diskutil info ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "drive_info",
          },
        ],
      },
    },
    expectedOutput:
      'Correct model name, serial, and full advertised capacity. Anything truncated, generic ("DEFAULT"), or showing wrong capacity points at firmware/SA corruption.',
    interpretation:
      "Detected correctly - PCB and SA likely fine. Wrong ID/capacity - firmware/SA. Not detected at all - PCB, motor, or seized drive.",
  },

  // -------------------------------------------------------------------------
  preamp_clean: {
    prerequisites: [
      "ESD-safe workspace, anti-static wrist strap.",
      "Torx driver set (T6/T8 typical).",
      "99% isopropyl alcohol, lint-free swabs, soft pencil eraser.",
      "Drive PSU disconnected before any disassembly.",
    ],
    os: {
      windows: {
        shell: "n/a - hardware procedure",
        tools: [],
        steps: [
          {
            label:
              "Remove PCB. Clean contact pads on PCB and head-stack with isopropyl. If oxidised, gentle pass with a pencil eraser, then alcohol again.",
            command: "# Hardware step - no command",
            requires: [],
          },
          {
            label: "Reseat PCB and re-run BIOS detection.",
            command:
              "Get-PhysicalDisk | Select DeviceId,FriendlyName,SerialNumber,Size",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "bash (root) - after hardware step",
        tools: ["util-linux"],
        steps: [
          {
            label: "Hardware: remove PCB, clean contacts, reseat.",
            command: "# Hardware step - no command",
            requires: [],
          },
          {
            label: "Re-detect after reseating.",
            command: "sudo dmesg -wH",
            requires: [],
          },
          {
            label: "Confirm device path appears.",
            command: "lsblk -o NAME,MODEL,SERIAL,SIZE",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal - after hardware step",
        tools: ["diskutil"],
        steps: [
          {
            label: "Hardware: clean and reseat PCB contacts.",
            command: "# Hardware step - no command",
            requires: [],
          },
          {
            label: "Re-detect after reseating.",
            command: "diskutil list",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "If contacts were the issue, the drive now identifies with correct model/capacity.",
    interpretation:
      "Fixed = preamp/contact issue confirmed. Still fails = move to PCB swap or firmware diagnostics.",
  },

  // -------------------------------------------------------------------------
  smart: {
    prerequisites: [
      "Drive identifies in BIOS/OS at all (skip otherwise).",
      "Pull S.M.A.R.T. without writing to the drive.",
    ],
    os: {
      windows: {
        shell: "PowerShell (Admin)",
        tools: ["smartmontools (smartctl) or CrystalDiskInfo"],
        steps: [
          {
            label: "Read full S.M.A.R.T. attributes.",
            command: "smartctl -a ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "smart",
          },
          {
            label: "Quick health summary.",
            command: "smartctl -H ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "smart",
          },
          {
            label:
              "Alternative GUI: open CrystalDiskInfo and select the drive.",
            command:
              'Start-Process "C:\\Program Files\\CrystalDiskInfo\\DiskInfo64.exe"',
            requires: [],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["smartmontools"],
        steps: [
          {
            label: "Full attributes.",
            command: "sudo smartctl -a ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "smart",
          },
          {
            label: "Health summary.",
            command: "sudo smartctl -H ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "smart",
          },
          {
            label: "Force USB-bridge passthrough if needed.",
            command: "sudo smartctl -d sat -a ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "smart",
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: ["smartmontools (brew install smartmontools)"],
        steps: [
          {
            label: "Full attributes.",
            command: "sudo smartctl -a ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "smart",
          },
          {
            label: "Health summary.",
            command: "sudo smartctl -H ${DEVICE}",
            requires: ["DEVICE"],
            outputType: "smart",
          },
        ],
      },
    },
    expectedOutput:
      "Look at: Reallocated_Sector_Ct (5), Current_Pending_Sector (197), Offline_Uncorrectable (198), Reported_Uncorrect (187), UDMA_CRC_Error_Count (199).",
    interpretation:
      "All nominal - hardware probably fine, look at filesystem. Pending/reallocated rising - bad sectors / head degradation. Unreadable S.M.A.R.T. - SA/firmware fault.",
  },

  // -------------------------------------------------------------------------
  clone_attempt: {
    prerequisites: [
      "Destination drive at least as large as the source.",
      "Source drive on a stable connection - prefer SATA over USB for ddrescue.",
      "Logfile path on a separate, healthy disk.",
      "Drive must NOT be mounted before cloning.",
    ],
    os: {
      windows: {
        shell: "PowerShell (Admin) or WSL",
        tools: [
          "ddrescue (via WSL or Cygwin)",
          "HDDSuperClone (native Windows)",
        ],
        steps: [
          {
            label: "First pass - copy everything readable, skip errors fast.",
            command: "ddrescue -d -n ${DEVICE} ${CLONE_DEST} ${LOGFILE}",
            requires: ["DEVICE", "CLONE_DEST", "LOGFILE"],
          },
          {
            label: "Second pass - retry the bad regions.",
            command: "ddrescue -d -r3 ${DEVICE} ${CLONE_DEST} ${LOGFILE}",
            requires: ["DEVICE", "CLONE_DEST", "LOGFILE"],
          },
          {
            label: "Inspect progress.",
            command: "ddrescuelog -t ${LOGFILE}",
            requires: ["LOGFILE"],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["gddrescue (apt install gddrescue)", "HDDSuperClone Live"],
        steps: [
          {
            label: "First pass - skip errors fast.",
            command: "sudo ddrescue -d -n ${DEVICE} ${CLONE_DEST} ${LOGFILE}",
            requires: ["DEVICE", "CLONE_DEST", "LOGFILE"],
          },
          {
            label: "Retry pass.",
            command: "sudo ddrescue -d -r3 ${DEVICE} ${CLONE_DEST} ${LOGFILE}",
            requires: ["DEVICE", "CLONE_DEST", "LOGFILE"],
          },
          {
            label: "Optional reverse pass for stubborn sectors.",
            command:
              "sudo ddrescue -d -R -r3 ${DEVICE} ${CLONE_DEST} ${LOGFILE}",
            requires: ["DEVICE", "CLONE_DEST", "LOGFILE"],
          },
          {
            label: "View map of recovered/bad regions.",
            command: "ddrescuelog -t ${LOGFILE}",
            requires: ["LOGFILE"],
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: ["ddrescue (brew install ddrescue)"],
        steps: [
          {
            label: "Unmount before cloning.",
            command: "diskutil unmountDisk ${DEVICE}",
            requires: ["DEVICE"],
          },
          {
            label: "First pass.",
            command: "sudo ddrescue -d -n ${DEVICE} ${CLONE_DEST} ${LOGFILE}",
            requires: ["DEVICE", "CLONE_DEST", "LOGFILE"],
          },
          {
            label: "Retry pass.",
            command: "sudo ddrescue -d -r3 ${DEVICE} ${CLONE_DEST} ${LOGFILE}",
            requires: ["DEVICE", "CLONE_DEST", "LOGFILE"],
          },
        ],
      },
    },
    expectedOutput:
      "Clean = >99.99% rescued, completes at near-platform speed. Partial = many seconds-per-sector retries, some unread regions. Failure = drive drops, hangs, or aborts mid-clone.",
    interpretation:
      "Clean = bad sectors / logical only. Partial = head degradation or bad-sector storm. Fails = mechanical (heads/SA/motor).",
  },

  // -------------------------------------------------------------------------
  fs_scan: {
    prerequisites: [
      "Cloning is complete - point the scanner at the IMAGE, not the original drive.",
      "Mount or attach the image read-only.",
    ],
    os: {
      windows: {
        shell: "PowerShell (Admin)",
        tools: ["R-Studio", "UFS Explorer", "OSFMount (to mount the image)"],
        steps: [
          {
            label:
              "Mount the image read-only with OSFMount, then point R-Studio at it.",
            command:
              '& "C:\\Program Files\\OSFMount\\OSFMount.com" -a -t file -f ${CLONE_DEST} -o ro -m #:',
            requires: ["CLONE_DEST"],
          },
          {
            label: "Open R-Studio CLI scan.",
            command:
              '& "C:\\Program Files\\R-Studio\\RStudio.exe" /scan ${IMAGE_PATH}',
            requires: ["IMAGE_PATH"],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["UFS Explorer for Linux", "testdisk", "photorec"],
        steps: [
          {
            label: "Loop-mount the image read-only.",
            command: "sudo losetup -fP --read-only ${CLONE_DEST}",
            requires: ["CLONE_DEST"],
          },
          {
            label: "Identify partitions.",
            command: "sudo fdisk -l ${CLONE_DEST}",
            requires: ["CLONE_DEST"],
          },
          {
            label: "Run testdisk against the image.",
            command: "sudo testdisk ${CLONE_DEST}",
            requires: ["CLONE_DEST"],
          },
          {
            label: "Carve files with photorec if filesystem is gone.",
            command: "sudo photorec ${CLONE_DEST}",
            requires: ["CLONE_DEST"],
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: ["R-Studio for Mac", "testdisk (brew install testdisk)"],
        steps: [
          {
            label: "Attach the image read-only.",
            command: "hdiutil attach -readonly -nomount ${CLONE_DEST}",
            requires: ["CLONE_DEST"],
          },
          {
            label: "Run testdisk.",
            command: "sudo testdisk ${CLONE_DEST}",
            requires: ["CLONE_DEST"],
          },
        ],
      },
    },
    expectedOutput:
      "A successful scan lists recoverable directory trees with sane file sizes. Garbled names with zero-byte files = filesystem too damaged for tree recovery, fall back to file-carving.",
    interpretation:
      "Files recovered - the cause was logical or minor bad sectors. Scan fails - actual data damage on the platter side, escalate.",
  },

  // -------------------------------------------------------------------------
  pcb_swap: {
    prerequisites: [
      "Cleanroom not required - this is a board-level swap.",
      "Donor PCB matching part number AND firmware revision.",
      "BIOS/ROM programmer (e.g. CH341A) for ROM transfer on modern drives.",
    ],
    os: {
      windows: {
        shell: "n/a - hardware procedure, then re-test detection",
        tools: ["CH341A flash software"],
        steps: [
          {
            label:
              "Hardware: read original ROM with programmer, write to donor PCB. Fit donor PCB.",
            command: "# Hardware step - no command",
            requires: [],
          },
          {
            label: "Power up and re-detect.",
            command:
              "Get-PhysicalDisk | Select DeviceId,FriendlyName,SerialNumber,Size",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["flashrom (for the ROM programmer)"],
        steps: [
          {
            label: "Read the original ROM via programmer.",
            command: "sudo flashrom -p ch341a_spi -r original_rom.bin",
            requires: [],
          },
          {
            label: "Write ROM to donor PCB chip.",
            command: "sudo flashrom -p ch341a_spi -w original_rom.bin",
            requires: [],
          },
          {
            label: "Confirm drive detects after fitting donor PCB.",
            command: "lsblk -o NAME,MODEL,SERIAL,SIZE",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: [],
        steps: [
          {
            label:
              "Hardware ROM transfer happens on a Linux/Windows host. After fitting:",
            command: "diskutil list",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "Drive identifies with correct model/serial/capacity after donor PCB is fitted with original ROM.",
    interpretation:
      "IDs correctly = PCB failure confirmed and resolved. Still fails = head/SA/firmware - escalate further.",
  },

  // -------------------------------------------------------------------------
  head_test: {
    prerequisites: [
      "PC-3000 (UDMA / Express / Portable) or equivalent professional tool.",
      "Drive on the PC-3000 terminal harness.",
      "Vendor-specific utility loaded for the drive family.",
    ],
    os: {
      windows: {
        shell: "PC-3000 terminal (Windows-based)",
        tools: [
          "PC-3000 utility for the drive family (WD/Seagate/Toshiba/etc.)",
        ],
        steps: [
          {
            label: "Open the family utility, select Heads -> Per-head test.",
            command: "# PC-3000 GUI - no shell command",
            requires: [],
          },
          {
            label: "Record which heads pass/fail; log to case file.",
            command: "# PC-3000 GUI - export head map",
            requires: ["MODEL", "SERIAL"],
          },
        ],
      },
      linux: {
        shell: "n/a - PC-3000 is Windows-only",
        tools: [],
        steps: [
          {
            label:
              "Run the PC-3000 host on Windows. Linux is not supported by the vendor utilities.",
            command: "# Not applicable",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "n/a - PC-3000 is Windows-only",
        tools: [],
        steps: [
          {
            label: "Run the PC-3000 host on Windows. macOS is not supported.",
            command: "# Not applicable",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "A per-head map showing read amplitude / error rate for each head. All green = heads OK. Any red = degraded or failed head.",
    interpretation:
      "All pass = problem is elsewhere (SA/firmware/PCB). Some fail = cleanroom head replacement needed.",
  },

  // -------------------------------------------------------------------------
  visual_inspection: {
    prerequisites: [
      "ISO Class 5 (Class 100) cleanroom or laminar flow bench.",
      "Cleanroom garments, gloves, hair cover.",
      "Bright cold-light source, magnification.",
      "Drive opened with platter cover removed - heads parked or removed.",
    ],
    os: {
      windows: {
        shell: "n/a - visual procedure",
        tools: [],
        steps: [
          {
            label:
              "Inspect each platter surface under angled light. Note any rings, scratches, debris, oxidation.",
            command: "# Visual procedure - no command",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "n/a - visual procedure",
        tools: [],
        steps: [
          {
            label: "Inspect each platter surface under angled light.",
            command: "# Visual procedure - no command",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "n/a - visual procedure",
        tools: [],
        steps: [
          {
            label: "Inspect each platter surface under angled light.",
            command: "# Visual procedure - no command",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "Mirror-clean surfaces with no rings, scratches, fingerprints, or debris.",
    interpretation:
      "Clean = head/SA fault, donor heads can recover. Damaged = platter media damage, set customer expectations to partial-or-none.",
  },

  // -------------------------------------------------------------------------
  event_history: {
    prerequisites: [
      "Talk to whoever was using the drive when it failed.",
      "Inspect the drive and PCB visually before answering.",
    ],
    os: {
      windows: {
        shell: "n/a - interview + visual",
        tools: [],
        steps: [
          {
            label:
              "Ask: was there a drop, surge, water exposure, or smoke event in the 24h before failure?",
            command: "# Interview step - no command",
            requires: [],
          },
          {
            label: "Inspect PCB for: scorched components, residue, swollen caps, green oxidation.",
            command: "# Visual step - no command",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "n/a - interview + visual",
        tools: [],
        steps: [
          {
            label: "Interview the user about preceding events.",
            command: "# Interview step - no command",
            requires: [],
          },
          {
            label: "Visually inspect PCB and HDA seam.",
            command: "# Visual step - no command",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "n/a - interview + visual",
        tools: [],
        steps: [
          {
            label: "Interview the user about preceding events.",
            command: "# Interview step - no command",
            requires: [],
          },
          {
            label: "Visually inspect PCB and HDA seam.",
            command: "# Visual step - no command",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "A clear cause story (or absence of one). Surge stories often correlate with a swap of PSU, lightning event, or bumped power strip. Drop stories often have a witness.",
    interpretation:
      "Event history dramatically narrows the search. Believe the customer; they almost always know what happened.",
  },

  // -------------------------------------------------------------------------
  tvs_check: {
    prerequisites: [
      "Drive PSU disconnected, PCB removed.",
      "Multimeter set to diode/continuity mode.",
      "Photograph the PCB before removing components.",
    ],
    os: {
      windows: {
        shell: "n/a - hardware test",
        tools: ["Multimeter (diode/continuity)"],
        steps: [
          {
            label:
              "Locate TVS diodes - small SMB-package, polarity stripe, near the SATA power connector. There are typically two: 5V rail and 12V rail.",
            command: "# Hardware location - no command",
            requires: [],
          },
          {
            label: "Probe across each diode in continuity mode. A short = beep / under 5 ohms. Healthy = open in both directions.",
            command: "# Hardware test - no command",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "n/a - hardware test",
        tools: ["Multimeter"],
        steps: [
          {
            label: "Locate TVS diodes near SATA power connector.",
            command: "# Hardware - no command",
            requires: [],
          },
          {
            label: "Continuity test across each.",
            command: "# Hardware - no command",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "n/a - hardware test",
        tools: ["Multimeter"],
        steps: [
          {
            label: "Locate TVS diodes near SATA power connector.",
            command: "# Hardware - no command",
            requires: [],
          },
          {
            label: "Continuity test across each.",
            command: "# Hardware - no command",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "Healthy: both diodes open in both directions. Failed: continuity beep / under 5 ohms across one or both.",
    interpretation:
      "A shorted TVS confirms a surge took out the protection. The drive itself is usually fine - lift the diode and re-test.",
  },

  // -------------------------------------------------------------------------
  security_check: {
    prerequisites: ["Drive identifies in BIOS/OS.", "Linux live USB or Victoria/HDD Sentinel on Windows."],
    os: {
      windows: {
        shell: "PowerShell or Linux live USB",
        tools: ["Victoria for Windows", "HDD Sentinel", "or use a Linux live USB with hdparm"],
        steps: [
          {
            label: "Open Victoria, select the drive, look at the SMART/Security tab. Note: enabled / locked / frozen flags.",
            command: "# GUI step - run Victoria",
            requires: [],
          },
          {
            label: "Or boot a Linux live USB and run:",
            command: "sudo hdparm -I ${DEVICE} | grep -A8 Security",
            requires: ["DEVICE"],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["hdparm"],
        steps: [
          {
            label: "Read the Security section.",
            command: "sudo hdparm -I ${DEVICE} | grep -A8 Security",
            requires: ["DEVICE"],
          },
        ],
      },
      macos: {
        shell: "n/a directly",
        tools: ["Linux live USB recommended"],
        steps: [
          {
            label: "macOS doesn't expose ATA security via diskutil. Boot Linux from USB and use hdparm.",
            command: "# Boot Linux live USB",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "A block like: 'Security: enabled, locked, not frozen, not expired'. Each flag matters.",
    interpretation:
      "enabled+locked = ATA password set. frozen = BIOS won't let you manage it (suspend/resume to clear). Frozen-not-locked is fine.",
  },

  // -------------------------------------------------------------------------
  capacity_check: {
    prerequisites: ["Drive identifies in OS or via BIOS.", "Know the model's spec (label or datasheet)."],
    os: {
      windows: {
        shell: "PowerShell (Admin)",
        tools: ["PowerShell"],
        steps: [
          {
            label: "Read OS-reported capacity.",
            command: "Get-PhysicalDisk | Select FriendlyName,Size",
            requires: [],
          },
          {
            label: "Compare against the printed label (e.g. 1 TB = 1,000,204,886,016 bytes).",
            command: "# Manual comparison",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["hdparm"],
        steps: [
          {
            label: "Read native and current max sectors.",
            command: "sudo hdparm -N ${DEVICE}",
            requires: ["DEVICE"],
          },
          {
            label: "Read the user-addressable capacity.",
            command: "sudo hdparm -I ${DEVICE} | grep -E '(device size|number of)'",
            requires: ["DEVICE"],
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: ["diskutil"],
        steps: [
          {
            label: "Read OS-reported size.",
            command: "diskutil info ${DEVICE} | grep -E '(Disk Size|Total Size)'",
            requires: ["DEVICE"],
          },
        ],
      },
    },
    expectedOutput:
      "hdparm -N output looks like 'max sectors = 1953525168/1953525168, HPA is disabled'. Mismatch (current < native) = HPA in place.",
    interpretation:
      "Matches label = no HPA/DCO. Smaller-but-clean = HPA, recoverable. Garbage = SA/translator damage.",
  },

  // -------------------------------------------------------------------------
  read_test: {
    prerequisites: [
      "Drive is identified by the OS.",
      "Drive is NOT mounted (read-only is fine; unmount partitions first).",
    ],
    os: {
      windows: {
        shell: "PowerShell (Admin) or WSL",
        tools: ["WSL with dd, or HxD"],
        steps: [
          {
            label: "Read the first sector via WSL.",
            command: "sudo dd if=/dev/sdX of=/tmp/sec0.bin bs=512 count=1",
            requires: [],
          },
          {
            label: "Or open ${DEVICE} in HxD as a physical disk and read the first sector.",
            command: "# GUI: HxD -> Open disk -> Physical disks -> ${MODEL}",
            requires: ["MODEL"],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["coreutils"],
        steps: [
          {
            label: "Read first physical sector.",
            command: "sudo dd if=${DEVICE} of=/dev/null bs=512 count=1 status=progress",
            requires: ["DEVICE"],
          },
          {
            label: "View the bytes (looking for boot signature 55 AA at offset 510 if MBR).",
            command: "sudo dd if=${DEVICE} bs=512 count=1 2>/dev/null | xxd | head",
            requires: ["DEVICE"],
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: ["dd, xxd"],
        steps: [
          {
            label: "Unmount and read first sector.",
            command: "diskutil unmountDisk ${DEVICE} && sudo dd if=${DEVICE} bs=512 count=1 | xxd | head",
            requires: ["DEVICE"],
          },
        ],
      },
    },
    expectedOutput:
      "1 record copied with no error, and bytes that don't look like all zeros / all FF.",
    interpretation:
      "Real data = drive can read. All zeros despite ID = translator. I/O error = mechanical or SA.",
  },

  // -------------------------------------------------------------------------
  seek_audio: {
    prerequisites: ["Drive powers on and spins up (skip otherwise)."],
    os: {
      windows: {
        shell: "n/a - listen test",
        tools: [],
        steps: [
          {
            label:
              "Power the drive on. Listen for 5 seconds after spin-up reaches steady-state. A normal drive emits a single soft seek as it loads heads off the ramp.",
            command: "# Listening step - no command",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "n/a - listen test",
        tools: [],
        steps: [
          {
            label: "Listen for seek/click within 5s of spin-up.",
            command: "# Listening - no command",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "n/a - listen test",
        tools: [],
        steps: [
          {
            label: "Listen for seek/click within 5s of spin-up.",
            command: "# Listening - no command",
            requires: [],
          },
        ],
      },
    },
    expectedOutput: "Soft single seek. Then mostly silent except for occasional re-cal seeks.",
    interpretation:
      "Total silence after a healthy spin = actuator coil is open. Repeated retry-clicks = head fault. Normal seek = mechanism is alive.",
  },

  // -------------------------------------------------------------------------
  helium_check: {
    prerequisites: ["Drive identifies and SMART is readable."],
    os: {
      windows: {
        shell: "PowerShell (Admin)",
        tools: ["smartmontools"],
        steps: [
          {
            label: "Confirm the model is helium-filled (look up datasheet, or label code 'He', 'Helio', WD Ultrastar, Seagate Exos).",
            command: "# Look up ${MODEL} datasheet",
            requires: ["MODEL"],
          },
          {
            label: "Read SMART attribute 22 (Helium_Level).",
            command: "smartctl -a ${DEVICE} | findstr /R \"^ *22 \"",
            requires: ["DEVICE"],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["smartmontools"],
        steps: [
          {
            label: "Read attribute 22.",
            command: "sudo smartctl -a ${DEVICE} | grep -E '^ *22 '",
            requires: ["DEVICE"],
          },
        ],
      },
      macos: {
        shell: "zsh / Terminal",
        tools: ["smartmontools"],
        steps: [
          {
            label: "Read attribute 22.",
            command: "sudo smartctl -a ${DEVICE} | grep -E '^ *22 '",
            requires: ["DEVICE"],
          },
        ],
      },
    },
    expectedOutput:
      "An attribute line like '22 Helium_Level 0x0023 100 100 025 Pre-fail Always - 100' (the trailing 100 is current level).",
    interpretation:
      "100 = sealed. Anything below = leaking. Below ~85 = drive is failing across all surfaces and time is short.",
  },

  // -------------------------------------------------------------------------
  rom_transfer: {
    prerequisites: [
      "PCB swap with a known-good donor was already attempted and failed.",
      "CH341A programmer + SOIC-8 clip on hand.",
      "PC running NeoProgrammer or asprogrammer.",
    ],
    os: {
      windows: {
        shell: "PowerShell (Admin) + NeoProgrammer GUI",
        tools: ["CH341A driver", "NeoProgrammer", "SOIC-8 clip"],
        steps: [
          {
            label: "Identify the 8-pin SOIC ROM on the original PCB (usually next to the controller, marked 25xx).",
            command: "# Hardware identification",
            requires: [],
          },
          {
            label: "Clip the CH341A onto the original ROM. Read 3 times in NeoProgrammer; verify all dumps are byte-identical. Save as patient_rom.bin.",
            command: "# NeoProgrammer GUI",
            requires: [],
          },
          {
            label: "Clip onto the donor PCB's ROM. Save donor_original.bin (in case you need to roll back). Erase, write patient_rom.bin, verify.",
            command: "# NeoProgrammer GUI",
            requires: [],
          },
          {
            label: "Mount donor PCB on patient drive. Power on, retest detection.",
            command: "Get-PhysicalDisk | Select FriendlyName,SerialNumber,Size",
            requires: [],
          },
        ],
      },
      linux: {
        shell: "bash (root)",
        tools: ["flashrom", "ch341a_spi programmer"],
        steps: [
          {
            label: "Read original ROM.",
            command: "sudo flashrom -p ch341a_spi -r patient_rom.bin",
            requires: [],
          },
          {
            label: "Read donor ROM as backup.",
            command: "sudo flashrom -p ch341a_spi -r donor_original.bin",
            requires: [],
          },
          {
            label: "Write patient ROM to donor.",
            command: "sudo flashrom -p ch341a_spi -w patient_rom.bin",
            requires: [],
          },
          {
            label: "Mount donor PCB, retest.",
            command: "lsblk -o NAME,MODEL,SERIAL,SIZE",
            requires: [],
          },
        ],
      },
      macos: {
        shell: "n/a directly",
        tools: ["use a Windows or Linux host for flashrom"],
        steps: [
          {
            label: "Run the ROM transfer on a Linux/Windows machine. After fitting:",
            command: "diskutil list",
            requires: [],
          },
        ],
      },
    },
    expectedOutput:
      "Drive identifies correctly with the donor PCB + transferred original ROM.",
    interpretation:
      "IDs = problem was ROM, not platter SA. Still fails = platter SA damage; lab needed. ROM unreadable = original NVRAM is dead, harder case.",
  },
};

export const DRIVE_VARS = [
  "DEVICE",
  "CLONE_DEST",
  "LOGFILE",
  "MODEL",
  "SERIAL",
  "CAPACITY",
  "IMAGE_PATH",
];

export function interpolate(command, vars) {
  return command.replace(/\$\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v && v.length > 0 ? v : "${" + k + "}";
  });
}

export function missingVars(step, vars) {
  return (step.requires || []).filter((k) => !vars[k] || vars[k].length === 0);
}
