// Static reference content surfaced from the topbar Reference button.
// Three sections: clean environment, parts sourcing, starter toolkit.
// Structured (not raw markdown) so the UI can render consistent cards.

export const knowledge = {
  clean_environment: {
    title: "Clean environment for HDD platter exposure",
    intro:
      "Cleanroom-grade air (ISO Class 5 / Class 100 = under 100 particles >=0.5um per ft^3) is the target. You don't need a permanent room - you need a 'clean enough' working volume of about 1-2 ft^3 for the 3-5 minutes a platter is actually exposed. A single particle landing under a flying head causes a head crash; a particle settling on a stationary platter that you wipe before reassembly is recoverable. Minimize exposure, work horizontal, never breathe over the open drive.",
    sections: [
      {
        id: "tier1",
        title: "Tier 1 - bathroom steam method",
        cost: "~$30 (gloves + mask)",
        suitable_for:
          "LAST RESORT only. Low-value drives where the alternative is throwing it away.",
        not_suitable_for:
          "Head-stack swaps. Any high-value data. Anything you might subsequently send to a lab.",
        body: "Run a hot shower for 8-10 minutes with the bathroom door closed. Steam causes airborne particles to nucleate around water droplets and settle out. Turn off water, wait 15-20 minutes for surfaces to dry slightly and air to calm. Wipe down the work surface with a damp lint-free cloth. Wear hairnet, mask, nitrile gloves. Work horizontal, lid off for the absolute minimum time. Residual humidity damages exposed electronics; you cannot validate cleanliness; this is triage only.",
        parts: [],
      },
      {
        id: "tier2",
        title: "Tier 2 - DIY laminar flow hood",
        cost: "$125-185 total",
        suitable_for:
          "Visual inspection, PCB and contact work, platter inspection, donor screws/swaps in low-risk drives.",
        not_suitable_for:
          "Head-stack swaps on irreplaceable data. Helium drives.",
        body: "Build a positive-pressure box about 3 ft wide x 2 ft deep x 2 ft tall, open on the operator-facing side. Mount the HEPA filter on the back wall with the fan pulling room air through it. Air flows out toward you, creating positive pressure in the working volume. Seal all seams with foil HVAC tape. Avoid recirculating air purifiers as the primary filter - they are not designed for laminar flow across an open work surface. Avoid carbon pre-filters that shed dust.",
        parts: [
          {
            name: "20x20x4 inch true-HEPA filter (MERV 17 / H13)",
            cost_usd: "40-70",
          },
          { name: "20-inch box fan with adjustable speed", cost_usd: "25-40" },
          {
            name: "4-mil clear polyethylene sheeting (10x25 ft roll)",
            cost_usd: "20",
          },
          {
            name: "PVC pipe frame (1/2 inch with elbows/tees) or 2x2 lumber",
            cost_usd: "25-35",
          },
          {
            name: "Foil HVAC tape and weatherstripping for sealing",
            cost_usd: "15",
          },
        ],
      },
      {
        id: "tier3",
        title: "Tier 3 - portable hardshell laminar flow cabinet",
        cost: "$400-2000",
        suitable_for:
          "Head-stack swaps, multi-platter work, anything where you'd otherwise hand the drive to a recovery lab.",
        not_suitable_for: "Helium drives (regardless of cleanliness).",
        body: "AC4000F-style benchtop clones from Chinese sellers (Alibaba, AliExpress) run roughly $400-900. Larger Airtech, Esco, or NuAire used units appear on eBay at $800-2000. Look for: H13 or H14 HEPA (NOT 'HEPA-type'), variable-speed blower, stainless or coated-steel work surface, gauge or indicator for filter loading. Avoid units sold without filter specs. Validation: rent or borrow a particle counter for one session - Temtop M2000 (~$200 to buy) or higher-end Lighthouse (rental ~$50-100/day) confirms ISO 5 with the blower running.",
        parts: [
          {
            name: "AC4000F-style hardshell cabinet (Chinese clone)",
            cost_usd: "400-900",
          },
          { name: "Used Airtech / Esco / NuAire (eBay)", cost_usd: "800-2000" },
          {
            name: "Particle counter for validation",
            cost_usd: "200 (buy) / 50-100 per day (rent)",
          },
        ],
      },
      {
        id: "personal_kit",
        title: "Personal kit (any tier)",
        cost: "~$85-130 starter",
        body: "Wear all of these even with Tier 1. Skin oils and clothing fibers are the worst contamination sources.",
        parts: [
          {
            name: "Nitrile gloves, powder-free, box of 100",
            cost_usd: "10-15",
          },
          { name: "Bouffant hairnets, pack of 100", cost_usd: "8" },
          {
            name: "Disposable cleanroom smock or Tyvek coverall",
            cost_usd: "10-25 each",
          },
          {
            name: "Lint-free polyester wipes (Texwipe TX609 equivalent)",
            cost_usd: "20-30",
          },
          {
            name: "ESD wrist strap with 1MOhm cord (NOT the $2 ones)",
            cost_usd: "10-15",
          },
          {
            name: "ESD anti-static mat with grounding cord",
            cost_usd: "25-40",
          },
        ],
      },
      {
        id: "limits",
        title: "Hard limits - do NOT DIY",
        body: "Helium-filled drives (most 8TB+ enterprise, many WD/HGST He8/He10/He12). Opening them vents the helium and the drive will not run reliably even after reseal. Drives requiring head-stack swap on platters that must spin during the swap (rare, exists in some Seagate F3 families). Any drive with visible platter damage where contamination has already occurred. Customer drives where a failed DIY attempt would block professional recovery.",
        parts: [],
      },
    ],
  },

  parts_sourcing: {
    title: "Parts sourcing and donor matching",
    intro:
      "A 'matching donor' is not just same model number. Two ST1000DM003 drives with different firmware revisions or site codes can have entirely different head maps and preamps. Mismatched swaps fail silently or write garbage adaptives back to the patient's System Area.",
    sections: [
      {
        id: "matching",
        title: "Matching strictness (in order)",
        body: "1. Model number (e.g. ST1000DM003). 2. Firmware revision (printed on the label, e.g. CC46, CC49). 3. Site code / factory code (Seagate uses SU, TK, WU). 4. Full P/N or product family code (Seagate's '1CH162-301', WD's 12-character DCM). 5. Date code - within a few months for tight matches. Between revisions: head count and head map (which physical heads exist and their order), preamp chip variant, servo wedge layout, sometimes platter density. Read the label carefully. Seagate: Model + P/N + Firmware + Site + Date. WD: Model + DCM + Date. Toshiba: Model + Firmware + HDD Code.",
        parts: [],
      },
      {
        id: "where_to_buy",
        title: "Where to buy donor drives",
        body: "donordrives.com - US-based, specializes in matched donors. ~$80-250 depending on capacity and rarity. They verify model/firmware/site code on request. Slower for rare matches. HDDZone - similar service, sometimes better stock on enterprise SAS/SCSI. eBay - cheapest, riskiest. Look for: clear photos of the actual drive label (not a stock photo), seller willing to confirm site code and firmware, return policy. Avoid: 'tested working - pulled from working system' with no SMART data, listings showing only top of drive, sellers who refuse label photos. 'Tested' usually means it powered on once. Local recyclers / e-waste - viable for drives older than ~2010. $5-15 per drive; useless for modern matching but excellent for older families.",
        parts: [
          { name: "donordrives.com (verified match)", cost_usd: "80-250" },
          { name: "HDDZone", cost_usd: "comparable" },
          { name: "eBay (with verified label photo)", cost_usd: "30-150" },
          { name: "Local e-waste / recycler", cost_usd: "5-15" },
        ],
      },
      {
        id: "pcb_only",
        title: "PCB-only sourcing",
        body: "For any drive newer than ~2008, ROM transfer is mandatory. The PCB contains adaptive data (head resistance values, preamp calibration, servo offsets) unique to the patient's heads. A blind PCB swap on a modern drive will at minimum cause read errors and at worst write incorrect adaptives back to the System Area. PCB part number is silkscreened on the board, usually 4-digit base + revision suffix (Seagate '100717520 REV C', WD '2060-771823-002 REV A'). The base must match exactly; revision matters because component values and trace layouts change between revs.",
        parts: [
          { name: "PCB from HDDZone or donordrives", cost_usd: "25-80" },
          { name: "PCB from eBay (verify label)", cost_usd: "15-50" },
        ],
      },
      {
        id: "head_stack",
        title: "Head-stack sourcing",
        body: "Significantly harder than PCB. Head map IDs (the logical-to-physical head numbering encoded in the SA) must match - a 4-platter drive with heads 0,1,2,3,4,5,7 logically active has a different map than one with 0,1,2,3,5,6,7. A donor with a different map will fail to read user data even if it spins up. Non-swappable in practice: most helium drives (heads mounted differently and seal destroyed on opening), Seagate F3-architecture drives where heads need chamber realignment with proprietary tooling, drives where the donor's heads have been parked unsafely. Use a head comb to safely move the head stack between drives - never let unloaded heads touch each other or the platter surface.",
        parts: [
          { name: "Matched head donor (full drive)", cost_usd: "150-400" },
          { name: "Head comb (drive-family specific)", cost_usd: "40-150" },
        ],
      },
      {
        id: "gotchas",
        title: "Common gotchas",
        body: "Counterfeit donors: rebranded drives sold as matching family. Always verify the label photo against your patient before paying. Stripped Torx: a single stripped screw on a head-stack mount can end the recovery. Use the right size, push down hard, turn slowly. Cheap ESD straps: $2 strap with no resistor either does nothing or actively shocks. Use 1 MOhm strap and verify continuity. eBay donors that arrive head-crashed: power them up briefly before opening, listen for clicking, check SMART. Roughly 1 in 5 eBay donors will be unusable on arrival - factor into costs. Mismatched firmware revisions causing silent corruption: the drive may appear to read but be writing wrong adaptives back. Always work from a clone or with the patient PCB write-protected during validation.",
        parts: [],
      },
    ],
  },

  toolkit: {
    title: "Starter toolkit for DIY HDD repair",
    intro:
      "Minimum useful set. Total ~$250-475 for everything except the clean environment. Where to compromise: cheap multimeter is fine; cheap Torx is not.",
    sections: [
      {
        id: "core",
        title: "Core kit",
        body: "Buy these first. Without them you can't do most procedures.",
        parts: [
          { name: "CH341A programmer with SOIC-8 clip", cost_usd: "15-20" },
          {
            name: "USB-to-TTL serial cable (FTDI or PL2303 with 3.3V level)",
            cost_usd: "8-15",
          },
          {
            name: "Hot air rework station (858D or 8586 clone)",
            cost_usd: "80-130",
          },
          {
            name: "Bench multimeter (Uni-T UT139C or similar)",
            cost_usd: "50-80",
          },
          {
            name: "Wiha or Wera Torx set (T6, T7, T8, T9, T10) - DO NOT cheap out",
            cost_usd: "30-50",
          },
        ],
      },
      {
        id: "consumables",
        title: "Consumables",
        body: "Replenish regularly. Don't reuse swabs.",
        parts: [
          {
            name: "Cleanroom swabs (Texwipe TX714A equivalent)",
            cost_usd: "20",
          },
          { name: "Isopropyl alcohol 99%, 16oz", cost_usd: "10" },
          { name: "Fine-tip flux pen", cost_usd: "8" },
          { name: "0.5mm leaded solder", cost_usd: "10" },
        ],
      },
      {
        id: "specialist",
        title: "Specialist (per drive family)",
        body: "Only buy when you need them - drive-family specific, expensive.",
        parts: [
          { name: "Head comb set (drive-family specific)", cost_usd: "40-150" },
          { name: "Spindle hub holder / chuck", cost_usd: "30-80" },
          { name: "PC-3000 (professional only)", cost_usd: "5000-15000" },
        ],
      },
      {
        id: "where_to_compromise",
        title: "Where to compromise (and where not to)",
        body: "Compromise on: multimeter (cheap is fine), iron (USB-powered works for SMB diodes), enclosures (improvised is OK for visual-only). Do NOT compromise on: Torx bits (cheap bits strip the tiny T6/T7 screws and end the recovery), ESD strap (cheap straps either do nothing or actively shock the drive), HEPA filter rating (anything other than H13/H14 is theatre).",
        parts: [],
      },
    ],
  },
};

export const knowledgeKeys = Object.keys(knowledge);
