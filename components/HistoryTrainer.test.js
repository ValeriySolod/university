// No React rendering test infra exists in this project yet (vitest runs
// under the plain "node" environment: no @testing-library/react, no jsdom,
// no "@/..." import-alias resolution configured for vitest), so this stays
// a focused, import-free regression guard for the bug Codex flagged: the
// outer <section>'s aria-labelledby must always resolve to a heading id
// that is actually mounted for the current view. It works by reading the
// component source files as text and checking, per view, that the id
// HistoryTrainer points at also appears as a real `id="..."` attribute in
// the component that view renders — so renaming a heading id in one place
// without the other fails this test instead of silently producing a
// dangling ARIA reference.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function componentSource(name) {
  return readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), "utf8");
}

const historyTrainerSource = componentSource("HistoryTrainer.jsx");

// Every view lib/useAttemptHistory.js can set (see its setView calls).
const ALL_VIEWS = ["list", "review", "retry", "retry-result"];

const SOURCE_BY_VIEW = {
  list: historyTrainerSource,
  review: componentSource("AttemptReview.jsx"),
  retry: componentSource("RetrySession.jsx"),
  "retry-result": componentSource("RetryResult.jsx"),
};

function readRegionLabelIdByView(source) {
  const match = source.match(/REGION_LABEL_ID_BY_VIEW\s*=\s*Object\.freeze\(\{([\s\S]*?)\}\);/);
  if (!match) throw new Error("REGION_LABEL_ID_BY_VIEW map not found in HistoryTrainer.jsx");
  const entries = {};
  const entryPattern = /["']?([\w-]+)["']?\s*:\s*["']([\w-]+)["']/g;
  let entryMatch;
  while ((entryMatch = entryPattern.exec(match[1])) !== null) {
    entries[entryMatch[1]] = entryMatch[2];
  }
  return entries;
}

describe("HistoryTrainer — outer region accessible name", () => {
  const regionLabelIdByView = readRegionLabelIdByView(historyTrainerSource);

  it("declares a labelledby id for every view the history hook can render", () => {
    for (const view of ALL_VIEWS) {
      expect(regionLabelIdByView[view], `missing label id for view "${view}"`).toEqual(expect.any(String));
    }
  });

  it("points each view at a heading id that is actually mounted for that view", () => {
    for (const view of ALL_VIEWS) {
      const id = regionLabelIdByView[view];
      const source = SOURCE_BY_VIEW[view];
      const idIsMounted = new RegExp(`id=(["'])${id}\\1`).test(source);
      expect(idIsMounted, `"${id}" (view "${view}") is not mounted in the component that view renders`).toBe(true);
    }
  });
});
