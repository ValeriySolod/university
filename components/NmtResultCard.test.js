// No React rendering test infra exists in this project yet (see
// HistoryTrainer.test.js), so this is a source-inspection regression test
// for the elapsed-time cap bug: a persisted result from before the
// clamp-at-submission fix (or any other malformed/legacy resultData) could
// carry an elapsedMs far above NMT_SESSION_DURATION_MS, which
// formatCountdown would render as an impossible value like 201:19. This
// guards that the component clamps resultData.elapsedMs before formatting,
// and cross-checks the resulting display string using the same helpers the
// component imports.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { NMT_SESSION_DURATION_MS, clampElapsedMs, formatCountdown } from "../lib/nmtSession";

const source = readFileSync(fileURLToPath(new URL("./NmtResultCard.jsx", import.meta.url)), "utf8").replace(/\r\n/g, "\n");

describe("NmtResultCard — elapsed time cap", () => {
  it("clamps resultData.elapsedMs before formatting it as the displayed duration", () => {
    expect(source).toContain("formatCountdown(clampElapsedMs(data.elapsedMs))");
  });

  it("caps a legacy, over-the-limit persisted elapsedMs to 60:00 when formatted", () => {
    const legacyElapsedMs = NMT_SESSION_DURATION_MS + 3 * 60 * 60 * 1000 + 19_000; // e.g. a stored 201:19

    const displayed = formatCountdown(clampElapsedMs(legacyElapsedMs));

    expect(displayed).toBe("60:00");
  });
});
