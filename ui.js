import {
  createState,
  recompute,
  answerTest,
  goBack,
  reset,
  remainingHypotheses,
  bestNextTest,
  recommendedActions,
  activeWarnings,
  allHypotheses,
  historyCards,
  getTest,
} from "./engine.js";
import {
  procedures,
  interpolate,
  missingVars,
  DRIVE_VARS,
} from "./data/procedures.js";
import {
  loadDrive,
  saveDrive,
  clearDrive,
  loadOS,
  saveOS,
  FIELD_LABELS,
  FIELD_HINTS,
  FIELD_KIND,
  FIELD_GUIDANCE,
} from "./drive.js";
import { parseDetectionOutput, parseStepOutput } from "./drive-parsers.js";
import {
  getOutput,
  setOutput,
  clearOutput,
  clearAllOutputs,
} from "./outputs.js";
import { repairProcedures } from "./data/repair-procedures.js";
import { knowledge } from "./data/knowledge.js";

let state = createState("technician");
let drive = loadDrive();
let osChoice = loadOS();

const els = {
  stage: document.getElementById("stage"),
  historyList: document.getElementById("historyList"),
  backBtn: document.getElementById("backBtn"),
  bestAction: document.getElementById("bestAction"),
  warningsList: document.getElementById("warningsList"),
  warningsSection: document.getElementById("warningsSection"),
  hypList: document.getElementById("hypList"),
  remainCount: document.getElementById("remainCount"),
  totalCount: document.getElementById("totalCount"),
  modeSwitch: document.getElementById("modeSwitch"),
  resetBtn: document.getElementById("resetBtn"),
  phaseLabel: document.getElementById("phaseLabel"),
  mapToggle: document.getElementById("mapToggle"),
  mapOverlay: document.getElementById("mapOverlay"),
  mapClose: document.getElementById("mapClose"),
  map: document.getElementById("map"),
  osSwitch: document.getElementById("osSwitch"),
  driveBtn: document.getElementById("driveBtn"),
  driveStatus: document.getElementById("driveStatus"),
  drawer: document.getElementById("driveDrawer"),
  drawerOverlay: document.getElementById("drawerOverlay"),
  drawerBody: document.getElementById("drawerBody"),
  drawerClose: document.getElementById("drawerClose"),
  drawerSave: document.getElementById("drawerSave"),
  drawerClear: document.getElementById("drawerClear"),
  playbookOverlay: document.getElementById("playbookOverlay"),
  playbookBody: document.getElementById("playbookBody"),
  playbookClose: document.getElementById("playbookClose"),
  referenceBtn: document.getElementById("referenceBtn"),
  referenceOverlay: document.getElementById("referenceOverlay"),
  referenceClose: document.getElementById("referenceClose"),
  referenceBody: document.getElementById("referenceBody"),
  refTabs: document.getElementById("refTabs"),
};

let activeRefTab = "clean_environment";

function severityClass(s) {
  return "sev-" + s;
}
function severityLabel(s) {
  return (
    {
      diy: "DIY",
      shop: "SHOP",
      lab: "LAB",
      "lab-cleanroom": "CLEANROOM",
      unrecoverable: "NONE",
    }[s] || s
  );
}

function renderHistory() {
  const cards = historyCards(state);
  els.historyList.innerHTML = "";
  if (cards.length === 0) {
    els.historyList.innerHTML =
      '<li class="history-empty">// no answers yet</li>';
  } else {
    cards.forEach(({ test, answer }, i) => {
      if (!test || !answer) return;
      const li = document.createElement("li");
      li.className =
        "history-item" + (i === cards.length - 1 ? " current" : "");
      li.innerHTML = `
        <div class="history-q">${escape(test.question)}</div>
        <div class="history-a">→ ${escape(answer.label)}</div>
      `;
      els.historyList.appendChild(li);
    });
  }
  els.backBtn.disabled = cards.length === 0;
}

function renderStage() {
  const next = bestNextTest(state);
  const remaining = remainingHypotheses(state);

  // Outcome state — no test can refine further
  if (!next || remaining.length <= 1) {
    if (remaining.length === 1) {
      const h = remaining[0];
      els.stage.innerHTML = `
        <div class="outcome-card">
          <div class="conclusion">// most likely cause</div>
          <h2>${escape(h.name)}</h2>
          <p style="color:var(--ink-dim);">${escape(h.description)}</p>
          <p style="font-family:var(--mono); font-size:12px; color:var(--ink-faint);">
            Severity: <span class="severity ${severityClass(h.severity)}" style="display:inline-block; padding:2px 6px; border:1px solid currentColor;">${severityLabel(h.severity)}</span>
          </p>
        </div>
      `;
    } else if (remaining.length === 0) {
      els.stage.innerHTML = `
        <div class="outcome-card" style="border-color: var(--bad-dim);">
          <div class="conclusion" style="color: var(--bad);">// no matching cause</div>
          <h2>Answers don't match any known pattern</h2>
          <p style="color:var(--ink-dim);">Step back and reconsider — your answers have eliminated every hypothesis. Either an observation was misread, or this is an unusual case worth escalating.</p>
        </div>
      `;
    } else {
      els.stage.innerHTML = `
        <div class="outcome-card">
          <div class="conclusion">// no further tests will narrow this</div>
          <h2>${remaining.length} possible causes remain</h2>
          <p style="color:var(--ink-dim);">Review the list on the right and follow the recommended action — they all point to the same class of intervention.</p>
        </div>
      `;
    }
    return;
  }

  const test = next.test;
  const stepNum = state.history.length + 1;
  els.stage.innerHTML = `
    <div class="stage-meta">Step ${stepNum} · ${test.phase === "lab" ? "lab" : "shop"} · risk: ${test.risk}</div>
    <h2 class="stage-question">${escape(test.question)}</h2>
    <p class="stage-detail">${escape(test.detail)}</p>
    <div class="answer-list">
      ${test.answers
        .map(
          (a, i) => `
        <button class="answer" data-test="${test.id}" data-answer="${a.id}">
          <span class="answer-marker">${String.fromCharCode(65 + i)}</span>
          <span class="answer-label">
            ${escape(a.label)}
            ${a.warning ? `<div class="answer-warning">⚠ ${escape(a.warning)}</div>` : ""}
          </span>
        </button>
      `,
        )
        .join("")}
    </div>
    ${renderProcedure(test)}
  `;

  for (const btn of els.stage.querySelectorAll(".answer")) {
    btn.addEventListener("click", () => {
      answerTest(state, btn.dataset.test, btn.dataset.answer);
      renderAll();
    });
  }
  wireProcedure();
}

function renderProcedure(test) {
  const proc = procedures[test.id];
  if (!proc) return "";

  const osBlock = proc.os[osChoice];
  const prereq = (proc.prerequisites || [])
    .map((p) => `<li>${escape(p)}</li>`)
    .join("");

  const stepsHtml = osBlock
    ? osBlock.steps.map((step, idx) => renderStep(step, idx, test.id)).join("")
    : `<p style="color:var(--ink-dim); font-size:13px;">No procedure recorded for this OS.</p>`;

  const tools =
    osBlock && osBlock.tools && osBlock.tools.length
      ? osBlock.tools
          .map((t) => `<span class="pill">${escape(t)}</span>`)
          .join("")
      : "";

  return `
    <section class="procedure">
      <h3>Step procedure</h3>
      ${
        proc.prerequisites && proc.prerequisites.length
          ? `<div class="procedure-section">
            <div class="procedure-meta">Prerequisites</div>
            <ul class="prereq">${prereq}</ul>
          </div>`
          : ""
      }
      <div class="procedure-section">
        <div class="procedure-meta">
          <span class="pill">${escape(osLabel(osChoice))}</span>
          ${osBlock ? `<span class="pill">${escape(osBlock.shell || "shell")}</span>` : ""}
          ${tools}
        </div>
        ${stepsHtml}
      </div>
      ${
        proc.expectedOutput
          ? `<div class="procedure-section">
            <div class="procedure-meta">Expected output</div>
            <div class="interp">${escape(proc.expectedOutput)}</div>
          </div>`
          : ""
      }
      ${
        proc.interpretation
          ? `<div class="procedure-section">
            <div class="procedure-meta">How to read the result</div>
            <div class="interp">${escape(proc.interpretation)}</div>
          </div>`
          : ""
      }
    </section>
  `;
}

function renderStep(step, idx, testId) {
  const missing = missingVars(step, drive);
  const isInformational = !step.command || /^#\s/.test(step.command.trim());

  if (isInformational) {
    return `
      <div class="cmd-block">
        <div class="cmd-label">${idx + 1}. ${escape(step.label)}</div>
        <div class="cmd-row">
          <pre class="cmd-text" style="color:var(--ink-dim);">${escape(step.command || "")}</pre>
        </div>
      </div>
    `;
  }

  if (missing.length > 0) {
    // Progressive disclosure: show inputs for the missing vars, hide the
    // command until they're filled. The user never copies a placeholder.
    const inputs = missing
      .map((k) => {
        const hint = (FIELD_HINTS[osChoice] || {})[k] || "";
        const guidance = FIELD_GUIDANCE[k] || "";
        return `
          <div class="step-field">
            <label>${escape(FIELD_LABELS[k] || k)}</label>
            ${guidance ? `<div class="step-guide">${escape(guidance)}</div>` : ""}
            <input data-step-input="${escape(k)}" value="${escape(drive[k] || "")}" placeholder="${escape(hint)}">
            ${hint ? `<div class="ph">e.g. ${escape(hint)}</div>` : ""}
          </div>
        `;
      })
      .join("");

    const kinds = new Set(missing.map((k) => FIELD_KIND[k] || "discovered"));
    let head;
    if (kinds.size === 1 && kinds.has("discovered")) {
      head = `Enter the ${missing.map((k) => escape(FIELD_LABELS[k] || k).toLowerCase()).join(", ")} to unlock this command.`;
    } else if (kinds.size === 1 && kinds.has("chosen")) {
      head = `Choose where to put the ${missing.map((k) => escape(FIELD_LABELS[k] || k).toLowerCase()).join(", ")}.`;
    } else {
      head = `Fill in the values below to unlock this command.`;
    }

    return `
      <div class="cmd-block needs-input">
        <div class="cmd-label">${idx + 1}. ${escape(step.label)}</div>
        <div class="cmd-prompt">
          <div class="cmd-prompt-head">${head}</div>
          ${inputs}
          <div class="cmd-prompt-foot">
            <button class="btn primary" data-step-save>Save & continue</button>
          </div>
        </div>
      </div>
    `;
  }

  const interpolated = interpolate(step.command, drive);
  return `
    <div class="cmd-block" data-test="${escape(testId)}" data-step="${idx}">
      <div class="cmd-label">${idx + 1}. ${escape(step.label)}</div>
      <div class="cmd-row">
        <pre class="cmd-text">${escape(interpolated)}</pre>
        <button class="cmd-copy" data-copy="${escape(interpolated)}">Copy</button>
      </div>
      ${renderOutputCapture(testId, idx, step)}
    </div>
  `;
}

function renderOutputCapture(testId, idx, step) {
  const stored = getOutput(testId, idx);
  const hasStored = !!(stored && stored.rawText);
  const expanded = hasStored;

  return `
    <details class="output-capture" ${expanded ? "open" : ""} data-test="${escape(testId)}" data-step="${idx}">
      <summary>
        <span>Output</span>
        ${
          hasStored
            ? `<span class="output-saved">saved ${escape(timeAgo(stored.savedAt))}</span>`
            : `<span class="output-empty">paste here when run</span>`
        }
      </summary>
      <div class="output-body">
        <textarea class="output-text" rows="6" placeholder="Paste the command's output here. Validation and field-extraction happen on save.">${escape(stored ? stored.rawText : "")}</textarea>
        <div class="output-foot">
          <button class="btn primary" data-output-save>Save & validate</button>
          ${hasStored ? `<button class="btn" data-output-clear>Clear</button>` : ""}
          <span class="output-status" data-output-status></span>
        </div>
        <div class="output-findings" data-output-findings></div>
      </div>
    </details>
  `;
}

function timeAgo(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const sec = Math.round((Date.now() - t) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function osLabel(os) {
  return { windows: "Windows", linux: "Linux", macos: "macOS" }[os] || os;
}

function wireProcedure() {
  for (const btn of els.stage.querySelectorAll(".cmd-copy")) {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch {}
        ta.remove();
      }
      btn.classList.add("copied");
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.textContent = "Copy";
      }, 1200);
    });
  }
  for (const block of els.stage.querySelectorAll(".cmd-block.needs-input")) {
    const saveBtn = block.querySelector("[data-step-save]");
    if (!saveBtn) continue;
    saveBtn.addEventListener("click", () => {
      for (const input of block.querySelectorAll("[data-step-input]")) {
        const k = input.dataset.stepInput;
        drive[k] = input.value.trim();
      }
      saveDrive(drive);
      renderAll();
    });
    for (const input of block.querySelectorAll("[data-step-input]")) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveBtn.click();
      });
    }
  }

  // Output capture: render any previously-saved findings on mount, and wire
  // the Save / Clear buttons.
  for (const cap of els.stage.querySelectorAll(".output-capture")) {
    const testId = cap.dataset.test;
    const stepIdx = Number(cap.dataset.step);
    const step = procedures[testId]?.os?.[osChoice]?.steps?.[stepIdx];
    const stored = getOutput(testId, stepIdx);
    if (stored && stored.rawText) {
      const parsed = parseStepOutput(
        stored.rawText,
        step?.outputType,
        osChoice,
      );
      paintOutputFindings(cap, parsed);
    }
    const saveBtn = cap.querySelector("[data-output-save]");
    saveBtn?.addEventListener("click", () => {
      const ta = cap.querySelector(".output-text");
      const text = ta.value;
      if (!text.trim()) {
        showOutputStatus(cap, "Nothing to save - paste output first.", "warn");
        return;
      }
      setOutput(testId, stepIdx, text);
      const parsed = parseStepOutput(text, step?.outputType, osChoice);
      paintOutputFindings(cap, parsed);
      if (parsed) {
        showOutputStatus(
          cap,
          `Saved. Recognised as ${parsed.format}. ${parsed.summary}`,
          "ok",
        );
      } else {
        showOutputStatus(
          cap,
          "Saved, but couldn't auto-parse this output. Paste contents are kept for the case file.",
          "warn",
        );
      }
    });
    const clearBtn = cap.querySelector("[data-output-clear]");
    clearBtn?.addEventListener("click", () => {
      clearOutput(testId, stepIdx);
      renderAll();
    });
  }
}

function showOutputStatus(cap, text, kind) {
  const el = cap.querySelector("[data-output-status]");
  if (!el) return;
  el.textContent = text;
  el.style.color =
    kind === "ok"
      ? "var(--accent)"
      : kind === "warn"
        ? "var(--warn)"
        : "var(--bad)";
}

function paintOutputFindings(cap, parsed) {
  const el = cap.querySelector("[data-output-findings]");
  if (!el) return;
  if (!parsed) {
    el.innerHTML = "";
    return;
  }

  const parts = [];

  // Records (drive_list / drive_info): clickable rows that fill four vars at once.
  if (parsed.records && parsed.records.length) {
    parts.push(
      `<div class="findings-head">Click a drive to set DEVICE / MODEL / SERIAL / CAPACITY:</div>`,
    );
    parts.push(
      parsed.records
        .map(
          (r, i) => `
      <button class="parsed-row" data-pick-record="${i}">
        <div class="parsed-summary">${escape(r.summary)}</div>
        ${r.meta ? `<div class="parsed-meta">${escape(r.meta)}</div>` : ""}
      </button>
    `,
        )
        .join(""),
    );
  }

  // Findings (smartctl etc): label/value rows with optional "use as VAR" button.
  if (parsed.findings && parsed.findings.length) {
    parts.push(`<div class="findings-head">Extracted values:</div>`);
    parts.push(
      `<div class="findings-grid">` +
        parsed.findings
          .map((f, i) => {
            const flag =
              f.flag === "warn"
                ? `<span class="finding-flag warn">!</span>`
                : f.flag === "info"
                  ? `<span class="finding-flag info">i</span>`
                  : "";
            const useBtn = f.key
              ? `<button class="btn-mini" data-use-finding="${i}">Use as ${escape(f.key)}</button>`
              : "";
            return `
            <div class="finding">
              <div class="finding-label">${flag}${escape(f.label)}</div>
              <div class="finding-value">${escape(String(f.value))}</div>
              <div class="finding-actions">${useBtn}</div>
            </div>
          `;
          })
          .join("") +
        `</div>`,
    );
  }

  el.innerHTML = parts.join("");

  // Wire record-pick.
  if (parsed.records) {
    for (const btn of el.querySelectorAll("[data-pick-record]")) {
      btn.addEventListener("click", () => {
        const rec = parsed.records[Number(btn.dataset.pickRecord)];
        Object.assign(drive, rec.fields);
        saveDrive(drive);
        showOutputStatus(
          cap,
          `Filled DEVICE / MODEL / SERIAL / CAPACITY from ${rec.fields.DEVICE}.`,
          "ok",
        );
        renderAll();
      });
    }
  }
  // Wire finding-pick.
  if (parsed.findings) {
    for (const btn of el.querySelectorAll("[data-use-finding]")) {
      btn.addEventListener("click", () => {
        const f = parsed.findings[Number(btn.dataset.useFinding)];
        if (!f.key) return;
        drive[f.key] = String(f.value);
        saveDrive(drive);
        showOutputStatus(cap, `Set ${f.key} = ${f.value}.`, "ok");
        renderAll();
      });
    }
  }
}

function renderBestAction() {
  const remaining = remainingHypotheses(state);
  const recs = recommendedActions(state);
  const next = bestNextTest(state);

  // Only push a confident action over a next-test suggestion. Partial-coverage
  // actions still surface, but the next-test wins until we're sure.
  const confident = recs.find((r) => r.confident);
  if (confident && (!next || remaining.length <= 2)) {
    const isLab =
      confident.severity === "lab" ||
      confident.severity === "lab-cleanroom" ||
      confident.severity === "unrecoverable";
    const hasPlaybook =
      confident.playbook && repairProcedures[confident.playbook];
    els.bestAction.innerHTML = `
      <div class="best-action ${isLab ? "lab" : ""}">
        <h3>${isLab ? "⚑ Recommended action" : "✓ Recommended action"}</h3>
        <div class="label">${escape(confident.label)}</div>
        <div class="detail">${escape(confident.detail)}</div>
        ${
          hasPlaybook
            ? `<button class="open-playbook" data-playbook="${escape(confident.playbook)}">▶ Open full repair playbook</button>`
            : ""
        }
      </div>
    `;
    if (hasPlaybook) {
      els.bestAction
        .querySelector(".open-playbook")
        ?.addEventListener("click", () => openPlaybook(confident.playbook));
    }
    return;
  }

  if (next) {
    const b = next.breakdown;
    const reductionPct = Math.round((1 - b.avg / b.before) * 100);
    els.bestAction.innerHTML = `
      <div class="best-action">
        <h3>► Next test</h3>
        <div class="label">${escape(next.test.question)}</div>
        <div class="why">expected to eliminate ~${reductionPct}% of remaining causes</div>
      </div>
    `;
    return;
  }

  els.bestAction.innerHTML = `<div class="best-action"><h3>—</h3><div class="why">No further tests apply.</div></div>`;
}

function renderWarnings() {
  const ws = activeWarnings(state);
  if (ws.length === 0) {
    els.warningsSection.style.display = "none";
    return;
  }
  els.warningsSection.style.display = "block";
  els.warningsList.innerHTML = ws
    .map(
      (w) => `
    <div class="warning-card">
      <div class="t">⚠ ${escape(w.title)}</div>
      <div class="b">${escape(w.body)}</div>
    </div>
  `,
    )
    .join("");
}

function renderHypotheses() {
  const all = allHypotheses(state);
  const remaining = new Set(remainingHypotheses(state).map((h) => h.id));
  els.remainCount.textContent = remaining.size;
  els.totalCount.textContent = `of ${all.length} total`;
  els.hypList.innerHTML = all
    .map(
      (h) => `
    <li class="hyp ${remaining.has(h.id) ? "" : "eliminated"}">
      <div class="name">
        <span>${escape(h.name)}</span>
        <span class="severity ${severityClass(h.severity)}">${severityLabel(h.severity)}</span>
      </div>
      <div class="desc">${escape(h.description)}</div>
    </li>
  `,
    )
    .join("");
}

// --- Map overlay -----------------------------------------------------------
// Renders a left-to-right column flow: history nodes (taken path) followed by
// the suggested next node, plus alternative tests as siblings.
function renderMap() {
  const cards = historyCards(state);
  const next = bestNextTest(state);

  const colWidth = 200;
  const rowHeight = 60;
  const padX = 20;
  const padY = 20;

  // Each column = one step. History columns have one node + one taken edge.
  const columns = [];
  cards.forEach(({ test, answer }) => {
    columns.push({ kind: "asked", test, takenAnswer: answer });
  });
  if (next) columns.push({ kind: "current", test: next.test });

  if (columns.length === 0) {
    els.map.innerHTML =
      '<p style="color:var(--ink-dim);">No path yet — answer a question to begin.</p>';
    return;
  }

  const width = padX * 2 + columns.length * colWidth;
  const height = padY * 2 + Math.max(rowHeight * 4, 200);

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Edges
  for (let i = 0; i < columns.length - 1; i++) {
    const x1 = padX + i * colWidth + 160;
    const x2 = padX + (i + 1) * colWidth;
    const y = padY + rowHeight / 2 + 10;
    svg += `<path class="edge taken" d="M${x1},${y} L${x2},${y}"/>`;
  }

  // Nodes
  columns.forEach((col, i) => {
    const x = padX + i * colWidth;
    const y = padY + 10;
    const cls = col.kind === "current" ? "current" : "asked";
    const labelText =
      col.test.question.length > 28
        ? col.test.question.slice(0, 26) + "…"
        : col.test.question;
    svg += `<g class="node ${cls}">
      <rect x="${x}" y="${y}" width="160" height="48"/>
      <text x="${x + 10}" y="${y + 20}">${escape(labelText)}</text>
      <text x="${x + 10}" y="${y + 38}" style="font-family:var(--mono); font-size:10px; fill:var(--ink-dim);">
        ${escape(col.kind === "asked" ? "→ " + (col.takenAnswer?.label.slice(0, 22) + (col.takenAnswer?.label.length > 22 ? "…" : "")) : "pending")}
      </text>
    </g>`;
  });

  svg += "</svg>";
  els.map.innerHTML = svg;
}

// --- Helpers ---------------------------------------------------------------
function escape(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function renderAll() {
  renderHistory();
  renderStage();
  renderBestAction();
  renderWarnings();
  renderHypotheses();
  renderDriveStatus();
  els.phaseLabel.textContent = `// ${state.mode} mode · ${osLabel(osChoice)}`;
  if (els.mapOverlay.classList.contains("open")) renderMap();
}

function renderDriveStatus() {
  const filled = DRIVE_VARS.filter(
    (k) => drive[k] && drive[k].length > 0,
  ).length;
  els.driveStatus.innerHTML =
    filled === 0
      ? `<span style="color:var(--ink-faint);">(empty)</span>`
      : filled === DRIVE_VARS.length
        ? `<span style="color:var(--accent);">(${filled}/${DRIVE_VARS.length})</span>`
        : `<span style="color:var(--warn);">(${filled}/${DRIVE_VARS.length})</span>`;
}

function renderDrawer(focusKey) {
  const hints = FIELD_HINTS[osChoice] || {};
  const fieldsHtml = DRIVE_VARS.map(
    (k) => `
    <div class="field">
      <label for="fld_${k}">${escape(FIELD_LABELS[k] || k)}</label>
      <input id="fld_${k}" data-key="${k}" value="${escape(drive[k] || "")}" placeholder="${escape(hints[k] || "")}">
      ${hints[k] ? `<div class="ph">e.g. ${escape(hints[k])}</div>` : ""}
    </div>
  `,
  ).join("");

  const parserHints = {
    windows: {
      summary: "Paste Get-PhysicalDisk output",
      command:
        "Get-PhysicalDisk | Format-List DeviceId,FriendlyName,SerialNumber,Size,MediaType,BusType,SpindleSpeed,FirmwareVersion,HealthStatus",
      placeholder:
        "DeviceId     : 0\nFriendlyName : ...\nSerialNumber : ...\nSize         : ...",
    },
    linux: {
      summary: "Paste lsblk output",
      command: "lsblk -o NAME,MODEL,SERIAL,SIZE,TYPE,TRAN",
      placeholder:
        "NAME   MODEL                 SERIAL          SIZE   TYPE TRAN\nsda    WDC WD10EZEX-08WN4A0  WD-WCC6Y3...    931.5G disk sata",
    },
    macos: {
      summary: "Paste diskutil list / info output",
      command: "diskutil list",
      placeholder:
        "/dev/disk0 (internal):\n   #:                       TYPE NAME                    SIZE       IDENTIFIER\n   0:      GUID_partition_scheme                        *500.3 GB   disk0",
    },
  };
  const ph = parserHints[osChoice] || parserHints.linux;

  els.drawerBody.innerHTML = `
    <details class="parser-section" ${focusKey ? "" : "open"}>
      <summary>${escape(ph.summary)}</summary>
      <div class="parser-cmd">From: <code>${escape(ph.command)}</code></div>
      <textarea id="parserInput" rows="6" placeholder="${escape(ph.placeholder)}"></textarea>
      <div class="parser-foot">
        <button class="btn" id="parserBtn">Parse</button>
        <span id="parserStatus" class="parser-status"></span>
      </div>
      <div id="parserResults"></div>
    </details>
    <h3 class="drawer-h3">Manual entry</h3>
    ${fieldsHtml}
  `;

  for (const input of els.drawerBody.querySelectorAll("input[data-key]")) {
    input.addEventListener("input", (e) => {
      drive[e.target.dataset.key] = e.target.value;
    });
  }

  const parserBtn = els.drawerBody.querySelector("#parserBtn");
  const parserInput = els.drawerBody.querySelector("#parserInput");
  parserBtn.addEventListener("click", () => runParser(parserInput.value));

  if (focusKey) {
    const focus = els.drawerBody.querySelector(`#fld_${focusKey}`);
    if (focus) focus.focus();
  }
}

function runParser(text) {
  const status = els.drawerBody.querySelector("#parserStatus");
  const results = els.drawerBody.querySelector("#parserResults");
  const { records, format } = parseDetectionOutput(text, osChoice);

  if (!format) {
    status.textContent = "Couldn't recognise the format.";
    status.style.color = "var(--bad)";
    results.innerHTML = "";
    return;
  }
  if (records.length === 0) {
    status.textContent = `Detected ${format}, but found no drives.`;
    status.style.color = "var(--warn)";
    results.innerHTML = "";
    return;
  }

  status.textContent = `Detected ${format} - ${records.length} drive${records.length === 1 ? "" : "s"} found. Click one:`;
  status.style.color = "var(--ink-dim)";
  results.innerHTML = records
    .map(
      (r, i) => `
    <button class="parsed-row" data-rec="${i}">
      <div class="parsed-summary">${escape(r.summary)}</div>
      ${r.meta ? `<div class="parsed-meta">${escape(r.meta)}</div>` : ""}
    </button>
  `,
    )
    .join("");

  for (const btn of results.querySelectorAll(".parsed-row")) {
    btn.addEventListener("click", () => {
      const rec = records[Number(btn.dataset.rec)];
      Object.assign(drive, rec.fields);
      saveDrive(drive);
      // Update visible inputs without losing the parser results.
      for (const k of Object.keys(rec.fields)) {
        const input = els.drawerBody.querySelector(`#fld_${k}`);
        if (input) input.value = drive[k] || "";
      }
      status.textContent = `Filled DEVICE / MODEL / SERIAL / CAPACITY from ${rec.fields.DEVICE}.`;
      status.style.color = "var(--accent)";
      renderDriveStatus();
    });
  }
}

function openDrawer(focusKey) {
  renderDrawer(focusKey);
  els.drawer.classList.add("open");
  els.drawerOverlay.classList.add("open");
  els.drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  els.drawer.classList.remove("open");
  els.drawerOverlay.classList.remove("open");
  els.drawer.setAttribute("aria-hidden", "true");
}

// --- Playbook overlay ------------------------------------------------------
function openPlaybook(id) {
  const pb = repairProcedures[id];
  if (!pb) return;
  els.playbookBody.innerHTML = renderPlaybook(pb);
  els.playbookOverlay.classList.add("open");
}

function closePlaybook() {
  els.playbookOverlay.classList.remove("open");
}

function renderPlaybook(pb) {
  const partsHtml = pb.parts.length
    ? `<ul class="pb-list">${pb.parts
        .map(
          (p) => `
        <li>
          <div class="lbl">${escape(p.name)} ${p.cost_usd ? `<span class="pb-cost">~$${escape(p.cost_usd)}</span>` : ""}</div>
          <div class="meta">Source: ${escape(p.source || "any")}</div>
          ${p.matching ? `<div class="meta">Match: ${escape(p.matching)}</div>` : ""}
        </li>
      `,
        )
        .join("")}</ul>`
    : `<p style="color:var(--ink-dim); font-size:13px;">No parts required.</p>`;

  const toolsHtml = `<ul class="pb-list">${pb.tools
    .map(
      (t) => `
      <li>
        <div class="lbl">${escape(t.name)} ${t.cost_usd ? `<span class="pb-cost">~$${escape(t.cost_usd)}</span>` : ""}</div>
        ${t.alternative ? `<div class="meta">Alternative: ${escape(t.alternative)}</div>` : ""}
      </li>
    `,
    )
    .join("")}</ul>`;

  const stepsHtml = pb.steps
    .map(
      (s, i) => `
    <div class="pb-step">
      <div class="pb-step-num">${i + 1}.</div>
      <div class="pb-step-body">
        <div class="pb-step-label">
          ${escape(s.label)}
          <span class="pb-step-risk risk-${escape(s.risk)}">risk: ${escape(s.risk)}</span>
        </div>
        <div class="pb-step-detail">${escape(s.detail)}</div>
      </div>
    </div>
  `,
    )
    .join("");

  const abortHtml = pb.abort_signals.length
    ? `<div class="pb-abort">
        <h3>⚠ Abort signals</h3>
        <ul>${pb.abort_signals.map((a) => `<li>${escape(a)}</li>`).join("")}</ul>
      </div>`
    : "";

  return `
    <div class="playbook-head">
      <h2 class="playbook-name">${escape(pb.name)}</h2>
      <div class="playbook-when">${escape(pb.when_used)}</div>
      <div class="playbook-meta">
        <span class="meta-pill diff-${escape(pb.difficulty)}"><span class="k">diff</span>${escape(pb.difficulty)}</span>
        <span class="meta-pill"><span class="k">time</span>${escape(pb.time_estimate)}</span>
        <span class="meta-pill env-${escape(pb.environment)}"><span class="k">env</span>${escape(pb.environment)}</span>
        <span class="meta-pill risk-${escape(pb.risk_to_data)}"><span class="k">data risk</span>${escape(pb.risk_to_data)}</span>
      </div>
    </div>

    <section class="pb-section">
      <h3>Parts needed</h3>
      ${partsHtml}
    </section>

    <section class="pb-section">
      <h3>Tools needed</h3>
      ${toolsHtml}
    </section>

    <section class="pb-section">
      <h3>Procedure</h3>
      ${stepsHtml}
    </section>

    <section class="pb-section">
      ${abortHtml}
    </section>

    <section class="pb-section">
      <div class="pb-success"><strong>Expected success:</strong> ${escape(pb.success_rate)}</div>
    </section>
  `;
}

// --- Reference overlay -----------------------------------------------------
function openReference(tab) {
  if (tab) activeRefTab = tab;
  els.refTabs.innerHTML = Object.keys(knowledge)
    .map(
      (k) => `
      <button class="ref-tab ${k === activeRefTab ? "active" : ""}" data-ref-tab="${escape(k)}">
        ${escape(knowledge[k].title)}
      </button>
    `,
    )
    .join("");
  for (const btn of els.refTabs.querySelectorAll("[data-ref-tab]")) {
    btn.addEventListener("click", () => openReference(btn.dataset.refTab));
  }
  els.referenceBody.innerHTML = renderReference(knowledge[activeRefTab]);
  els.referenceOverlay.classList.add("open");
}

function closeReference() {
  els.referenceOverlay.classList.remove("open");
}

function renderReference(section) {
  if (!section) return "";
  const sectionsHtml = section.sections
    .map((s) => {
      const pillsHtml = [
        s.cost ? `<span class="ref-cost">${escape(s.cost)}</span>` : "",
        s.suitable_for
          ? `<span class="ref-suit">For: ${escape(s.suitable_for)}</span>`
          : "",
        s.not_suitable_for
          ? `<span class="ref-not-suit">Not: ${escape(s.not_suitable_for)}</span>`
          : "",
      ]
        .filter(Boolean)
        .join("");
      const partsHtml =
        s.parts && s.parts.length
          ? `<ul class="ref-parts">${s.parts
              .map(
                (p) => `
              <li>
                <span class="ref-part-name">${escape(p.name)}</span>
                <span class="ref-part-cost">${p.cost_usd ? `~$${escape(p.cost_usd)}` : ""}</span>
              </li>
            `,
              )
              .join("")}</ul>`
          : "";
      return `
        <div class="ref-section">
          <div class="ref-section-head">
            <h3>${escape(s.title)}</h3>
            ${pillsHtml}
          </div>
          ${s.body ? `<div class="ref-body">${escape(s.body)}</div>` : ""}
          ${partsHtml}
        </div>
      `;
    })
    .join("");

  return `
    <div class="ref-intro">${escape(section.intro)}</div>
    ${sectionsHtml}
  `;
}

// --- Wiring ----------------------------------------------------------------
els.backBtn.addEventListener("click", () => {
  goBack(state);
  renderAll();
});

els.resetBtn.addEventListener("click", () => {
  if (
    !confirm(
      "Reset everything? This clears the diagnostic history, drive specifics, and all captured command outputs.",
    )
  )
    return;
  reset(state);
  drive = clearDrive();
  clearAllOutputs();
  renderAll();
});

els.modeSwitch.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-mode]");
  if (!btn) return;
  state = createState(btn.dataset.mode);
  for (const b of els.modeSwitch.querySelectorAll("button")) {
    b.classList.toggle("active", b === btn);
  }
  renderAll();
});

els.mapToggle.addEventListener("click", () => {
  els.mapOverlay.classList.add("open");
  renderMap();
});
els.mapClose.addEventListener("click", () =>
  els.mapOverlay.classList.remove("open"),
);
els.mapOverlay.addEventListener("click", (e) => {
  if (e.target === els.mapOverlay) els.mapOverlay.classList.remove("open");
});

els.osSwitch.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-os]");
  if (!btn) return;
  osChoice = btn.dataset.os;
  saveOS(osChoice);
  for (const b of els.osSwitch.querySelectorAll("button")) {
    b.classList.toggle("active", b === btn);
  }
  renderAll();
});

els.driveBtn.addEventListener("click", () => openDrawer());
els.drawerClose.addEventListener("click", closeDrawer);
els.drawerOverlay.addEventListener("click", closeDrawer);
els.drawerSave.addEventListener("click", () => {
  saveDrive(drive);
  closeDrawer();
  renderAll();
});
els.drawerClear.addEventListener("click", () => {
  drive = clearDrive();
  renderDrawer();
  renderAll();
});

els.playbookClose.addEventListener("click", closePlaybook);
els.playbookOverlay.addEventListener("click", (e) => {
  if (e.target === els.playbookOverlay) closePlaybook();
});

els.referenceBtn.addEventListener("click", () => openReference());
els.referenceClose.addEventListener("click", closeReference);
els.referenceOverlay.addEventListener("click", (e) => {
  if (e.target === els.referenceOverlay) closeReference();
});

// Set initial active OS button.
for (const b of els.osSwitch.querySelectorAll("button")) {
  b.classList.toggle("active", b.dataset.os === osChoice);
}

renderAll();
