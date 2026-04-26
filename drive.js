// Drive specifics + OS preference, persisted to localStorage so commands stay
// pre-filled across reloads. The values feed into procedure interpolation in
// data/procedures.js.

const STORAGE_KEY = "hdd-triage-drive-v1";
const OS_KEY = "hdd-triage-os-v1";
const THEME_KEY = "hdd-triage-theme-v1";

const EMPTY = {
  DEVICE: "",
  CLONE_DEST: "",
  LOGFILE: "",
  MODEL: "",
  SERIAL: "",
  CAPACITY: "",
  IMAGE_PATH: "",
};

export const FIELD_LABELS = {
  DEVICE: "Device path",
  CLONE_DEST: "Clone destination",
  LOGFILE: "ddrescue logfile",
  MODEL: "Drive model",
  SERIAL: "Drive serial",
  CAPACITY: "Capacity",
  IMAGE_PATH: "Mounted image path",
};

// "discovered" = read from a detection command's output (DEVICE, MODEL, etc.)
// "chosen"     = a path or value the technician picks (CLONE_DEST, LOGFILE)
export const FIELD_KIND = {
  DEVICE: "discovered",
  MODEL: "discovered",
  SERIAL: "discovered",
  CAPACITY: "discovered",
  CLONE_DEST: "chosen",
  LOGFILE: "chosen",
  IMAGE_PATH: "chosen",
};

export const FIELD_GUIDANCE = {
  DEVICE:
    "Source device path. Read from your earlier detection command, or paste that output into the parser above.",
  MODEL: "Drive model. Read from the detection output.",
  SERIAL: "Drive serial. Read from the detection output.",
  CAPACITY: "Drive capacity. Read from the detection output.",
  CLONE_DEST:
    "Pick a path for the clone image. Needs to be on a different, healthy drive with free space at least as large as the source.",
  LOGFILE:
    "Pick a path for ddrescue's map/log file. Typically alongside the clone, .log extension. Lets you resume an interrupted clone.",
  IMAGE_PATH:
    "Where you'll mount or attach the clone for filesystem scanning. Set this after you've actually mounted it.",
};

export const FIELD_HINTS = {
  windows: {
    DEVICE: "\\\\.\\PhysicalDrive2",
    CLONE_DEST: "D:\\recovery\\clone.img",
    LOGFILE: "D:\\recovery\\clone.log",
    MODEL: "WDC WD10EZEX-08WN4A0",
    SERIAL: "WD-WCC6Y3XXXXXX",
    CAPACITY: "1 TB",
    IMAGE_PATH: "E:\\",
  },
  linux: {
    DEVICE: "/dev/sdb",
    CLONE_DEST: "/mnt/recovery/clone.img",
    LOGFILE: "/mnt/recovery/clone.log",
    MODEL: "WDC WD10EZEX-08WN4A0",
    SERIAL: "WD-WCC6Y3XXXXXX",
    CAPACITY: "1 TB",
    IMAGE_PATH: "/mnt/clone",
  },
  macos: {
    DEVICE: "/dev/disk4",
    CLONE_DEST: "/Volumes/Recovery/clone.img",
    LOGFILE: "/Volumes/Recovery/clone.log",
    MODEL: "WDC WD10EZEX-08WN4A0",
    SERIAL: "WD-WCC6Y3XXXXXX",
    CAPACITY: "1 TB",
    IMAGE_PATH: "/Volumes/clone",
  },
};

export function loadDrive() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

export function saveDrive(drive) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drive));
  } catch {
    // localStorage unavailable - silently no-op
  }
}

export function clearDrive() {
  const fresh = { ...EMPTY };
  saveDrive(fresh);
  return fresh;
}

export function loadOS() {
  return localStorage.getItem(OS_KEY) || detectOS();
}

export function saveOS(os) {
  try {
    localStorage.setItem(OS_KEY, os);
  } catch {
    // ignore
  }
}

function detectOS() {
  const ua = (navigator.userAgent || "").toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  return "linux";
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || detectTheme();
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

function detectTheme() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}
