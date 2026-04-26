// Detection-output parsers. Take raw stdout from common drive-listing
// commands and return [{ summary, fields: { DEVICE, MODEL, SERIAL, CAPACITY } }].
// The drawer uses the array to render clickable rows that populate the form.

const PS_KEYS = [
  "DeviceId",
  "Number",
  "FriendlyName",
  "SerialNumber",
  "Size",
  "MediaType",
  "BusType",
  "SpindleSpeed",
  "FirmwareVersion",
  "HealthStatus",
];

function formatBytes(s) {
  const n = parseInt(String(s).replace(/[,\s]/g, ""), 10);
  if (!n || isNaN(n)) return "";
  if (n >= 1e12) {
    const tb = n / 1e12;
    return (
      (tb >= 10 ? Math.round(tb) : tb.toFixed(1).replace(/\.0$/, "")) + " TB"
    );
  }
  if (n >= 1e9) return Math.round(n / 1e9) + " GB";
  if (n >= 1e6) return Math.round(n / 1e6) + " MB";
  return n + " B";
}

// PowerShell parser. Handles both the well-formed Format-List output (each
// "Key : Value" on its own line, blocks separated by blank lines) AND the
// flattened/concatenated form a user pastes when copying from a wrapped
// terminal where line breaks are lost.
function parsePowerShell(text) {
  const allKeys = PS_KEYS.join("|");
  const re = new RegExp(
    `(${allKeys})\\s*:\\s*(.*?)(?=(?:${allKeys})\\s*:|$)`,
    "gs",
  );
  const records = [];
  let current = null;
  for (const m of text.matchAll(re)) {
    const key = m[1];
    const value = m[2].replace(/\s+$/g, "").replace(/\.$/, "").trim();
    if (key === "DeviceId" || key === "Number") {
      if (current) records.push(current);
      current = { _id: value };
      current[key] = value;
    } else {
      if (!current) current = {};
      current[key] = value;
    }
  }
  if (current) records.push(current);
  return records
    .filter((r) => r._id !== undefined && r._id !== "")
    .map((r) => {
      const id = r._id;
      const model = r.FriendlyName || "";
      const serial = (r.SerialNumber || "").trim();
      const size = r.Size ? formatBytes(r.Size) : "";
      const media = r.MediaType ? ` ${r.MediaType}` : "";
      return {
        summary: `\\\\.\\PhysicalDrive${id} - ${model || "(unknown)"} - ${size}${media}`,
        meta: r.HealthStatus ? `Health: ${r.HealthStatus}` : "",
        fields: {
          DEVICE: `\\\\.\\PhysicalDrive${id}`,
          MODEL: model,
          SERIAL: serial,
          CAPACITY: size,
        },
      };
    });
}

// lsblk parser. Expects tabular output with a header row, e.g.
// `lsblk -o NAME,MODEL,SERIAL,SIZE,TYPE,TRAN`.
function parseLsblk(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const header = lines[0]
    .split(/\s{2,}|\t+/)
    .map((h) => h.trim().toUpperCase());
  const idx = (h) => header.indexOf(h);
  const iName = idx("NAME");
  const iModel = idx("MODEL");
  const iSerial = idx("SERIAL");
  const iSize = idx("SIZE");
  const iType = idx("TYPE");
  if (iName < 0) return [];

  return lines
    .slice(1)
    .map((line) => {
      // lsblk uses fixed-width columns; split conservatively on 2+ spaces.
      const cols = line.split(/\s{2,}/).map((c) => c.trim());
      // If the line uses tree characters, strip them off NAME.
      const name = cols[iName] ? cols[iName].replace(/^[├─└│\s]+/, "") : "";
      if (!name) return null;
      if (iType >= 0 && cols[iType] && cols[iType] !== "disk") return null;
      const model = iModel >= 0 ? cols[iModel] || "" : "";
      const serial = iSerial >= 0 ? cols[iSerial] || "" : "";
      const size = iSize >= 0 ? cols[iSize] || "" : "";
      return {
        summary: `/dev/${name} - ${model || "(unknown)"} - ${size}`,
        meta: "",
        fields: {
          DEVICE: `/dev/${name}`,
          MODEL: model,
          SERIAL: serial,
          CAPACITY: size,
        },
      };
    })
    .filter(Boolean);
}

// diskutil parser. Accepts either `diskutil list` (uses /dev/diskN headers)
// or `diskutil info /dev/diskN` (key-colon-value pairs).
function parseDiskutil(text) {
  // Form 1: `diskutil info` style key/value
  if (/Device Identifier:/i.test(text)) {
    const get = (k) => {
      const m = text.match(new RegExp(`${k}\\s*:\\s*(.+)`, "i"));
      return m ? m[1].trim() : "";
    };
    const id = get("Device Identifier");
    const model =
      get("Device / Media Name") || get("Media Name") || get("Device Node");
    const serial = ""; // diskutil info doesn't include serial directly
    const sizeRaw = get("Disk Size") || get("Total Size");
    const sizeMatch = sizeRaw.match(/^([\d.]+\s*[KMGT]?B)/);
    const size = sizeMatch ? sizeMatch[1] : sizeRaw;
    return [
      {
        summary: `/dev/${id || "diskN"} - ${model || "(unknown)"} - ${size}`,
        meta: "",
        fields: {
          DEVICE: `/dev/${id}`,
          MODEL: model,
          SERIAL: serial,
          CAPACITY: size,
        },
      },
    ];
  }
  // Form 2: `diskutil list` - each /dev/diskN block has a header line.
  const blocks = text.split(/(?=^\/dev\/disk\d+)/m).filter((b) => b.trim());
  return blocks
    .map((block) => {
      const headerMatch = block.match(/^\/dev\/(disk\d+)/);
      if (!headerMatch) return null;
      const id = headerMatch[1];
      // First data row often shows the disk's overall scheme/size:
      const schemeRow = block.match(/\*([\d.]+\s*[KMGT]?B)/);
      const size = schemeRow ? schemeRow[1] : "";
      // Try to extract a name from the partition_scheme line:
      const nameMatch = block.match(/GUID_partition_scheme\s+(.+?)\s{2,}\*/);
      const model = nameMatch ? nameMatch[1].trim() : "";
      return {
        summary: `/dev/${id} - ${model || "(see diskutil info for model)"} - ${size}`,
        meta: "",
        fields: {
          DEVICE: `/dev/${id}`,
          MODEL: model,
          SERIAL: "",
          CAPACITY: size,
        },
      };
    })
    .filter(Boolean);
}

// smartctl -a / -H parser. Pulls identity (model/serial/capacity/firmware) plus
// the headline attributes a tech actually cares about during triage.
function parseSmartctl(text) {
  const get = (re) => {
    const m = text.match(re);
    return m ? m[1].trim() : "";
  };

  const model =
    get(/^Device Model:\s*(.+)$/m) ||
    get(/^Model Number:\s*(.+)$/m) ||
    get(/^Product:\s*(.+)$/m);
  const serial = get(/^Serial Number:\s*(.+)$/m);
  const firmware =
    get(/^Firmware Version:\s*(.+)$/m) || get(/^Revision:\s*(.+)$/m);
  const capRaw =
    get(/^User Capacity:\s*(.+)$/m) || get(/^Total NVM Capacity:\s*(.+)$/m);
  const capMatch = capRaw.match(/\[(.+?)\]/);
  const capacity = capMatch
    ? capMatch[1]
    : (capRaw.match(/^([\d.,]+\s*[KMGT]?B)/) || [, ""])[1];

  const healthRaw =
    get(/^SMART overall-health self-assessment test result:\s*(\w+)/m) ||
    get(/^SMART Health Status:\s*(\w+)/m);
  const health = healthRaw || "";

  // Attribute table - columns vary; we just grep RAW_VALUE for the IDs that
  // actually matter for triage.
  const attr = (id, name) => {
    const re = new RegExp(`^\\s*${id}\\s+${name}\\s+.+?\\s(\\d+)\\s*$`, "m");
    const m = text.match(re);
    return m ? m[1] : "";
  };
  const attrs = {
    reallocated: attr(5, "Reallocated_Sector_Ct"),
    pending: attr(197, "Current_Pending_Sector"),
    uncorrectable: attr(198, "Offline_Uncorrectable"),
    udma_crc: attr(199, "UDMA_CRC_Error_Count"),
    reported_uncorrect: attr(187, "Reported_Uncorrect"),
  };

  const findings = [];
  if (model) findings.push({ key: "MODEL", label: "Model", value: model });
  if (serial) findings.push({ key: "SERIAL", label: "Serial", value: serial });
  if (capacity)
    findings.push({ key: "CAPACITY", label: "Capacity", value: capacity });
  if (firmware)
    findings.push({ key: null, label: "Firmware", value: firmware });
  if (health) findings.push({ key: null, label: "Health", value: health });

  for (const [k, v] of Object.entries(attrs)) {
    if (v !== "") {
      const flag = Number(v) > 0 ? (k === "udma_crc" ? "info" : "warn") : "ok";
      findings.push({
        key: null,
        label: k.replace(/_/g, " "),
        value: v,
        flag,
      });
    }
  }

  if (findings.length === 0) return null;

  return {
    format: "smartctl",
    findings,
    summary: health
      ? `S.M.A.R.T. ${health.toUpperCase()}${attrs.pending ? ` - ${attrs.pending} pending` : ""}${attrs.reallocated ? `, ${attrs.reallocated} reallocated` : ""}`
      : `S.M.A.R.T. attributes captured`,
  };
}

// Dispatcher used by the per-step output capture. Tries the parser hinted by
// outputType first, then falls back to format sniffing so a paste in the wrong
// step still gets parsed.
export function parseStepOutput(text, outputType, os) {
  const t = String(text || "").trim();
  if (!t) return null;

  if (outputType === "smart") {
    const r = parseSmartctl(t);
    if (r) return r;
  }
  if (outputType === "drive_list" || outputType === "drive_info") {
    const { records, format } = parseDetectionOutput(t, os);
    if (records.length) {
      return {
        format,
        findings: [],
        records,
        summary: `${records.length} drive${records.length === 1 ? "" : "s"} detected`,
      };
    }
  }
  // Unhinted or fallback: try detection, then smart.
  const det = parseDetectionOutput(t, os);
  if (det.records.length) {
    return {
      format: det.format,
      findings: [],
      records: det.records,
      summary: `${det.records.length} drive${det.records.length === 1 ? "" : "s"} detected`,
    };
  }
  const s = parseSmartctl(t);
  if (s) return s;
  return null;
}

export function parseDetectionOutput(text, os) {
  const t = String(text || "").trim();
  if (!t) return { records: [], format: null };

  // Auto-detect format. Honour the active OS first, but fall back to sniffing
  // if the user pastes Linux output while on the Windows tab.
  const looksPS =
    /(?:DeviceId|Number)\s*:/i.test(t) && /FriendlyName\s*:/i.test(t);
  const looksLsblk = /^\s*NAME\b.*\bMODEL\b/im.test(t);
  const looksDiskutil =
    /\/dev\/disk\d+/i.test(t) || /Device Identifier:/i.test(t);

  let format = null;
  let records = [];

  if (os === "windows" && looksPS) {
    format = "powershell";
    records = parsePowerShell(t);
  } else if (os === "linux" && looksLsblk) {
    format = "lsblk";
    records = parseLsblk(t);
  } else if (os === "macos" && looksDiskutil) {
    format = "diskutil";
    records = parseDiskutil(t);
  } else if (looksPS) {
    format = "powershell";
    records = parsePowerShell(t);
  } else if (looksLsblk) {
    format = "lsblk";
    records = parseLsblk(t);
  } else if (looksDiskutil) {
    format = "diskutil";
    records = parseDiskutil(t);
  }

  return { records, format };
}
