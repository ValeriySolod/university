// See HistoryTrainer.test.js for why this is a source-inspection regression
// test rather than a rendered-DOM one: vitest runs under the plain "node"
// environment here (no @testing-library/react, no jsdom), so there is no
// rendering infra to click a real button or assert `document.activeElement`
// against. This guards the contract clear-attempt-history's focus
// management relies on: the "Очистити історію" button only exists behind
// the non-empty-attempts branch, opening the confirmation moves focus to
// the safe "Скасувати" action, cancelling restores focus to the trigger,
// and confirming never attempts to refocus the (about to be removed)
// trigger.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("./AttemptHistoryList.jsx", import.meta.url)), "utf8").replace(/\r\n/g, "\n");

function sliceBetween(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = end ? source.indexOf(end, startIndex) : source.length;
  expect(startIndex, `expected to find "${start}" in AttemptHistoryList.jsx`).toBeGreaterThanOrEqual(0);
  return source.slice(startIndex, endIndex === -1 ? source.length : endIndex);
}

function functionBody(name) {
  return sliceBetween(`function ${name}() {`, "\n  }");
}

describe("AttemptHistoryList — clear-history confirmation", () => {
  it("returns the empty-history state before the clear button is ever mentioned", () => {
    const emptyBranch = sliceBetween("if (attempts.length === 0)", "handleCancelClear");
    expect(emptyBranch).toContain("history-empty");
    expect(emptyBranch).not.toContain("Очистити історію");
  });

  it("renders the Ukrainian clear button and confirmation copy", () => {
    expect(source).toContain("Очистити історію");
    expect(source).toContain("Видалити всю історію спроб? Цю дію неможливо скасувати.");
    expect(source).toContain("Так, очистити");
    expect(source).toContain("Скасувати");
  });

  it("keeps refs for the trigger and the cancel action", () => {
    expect(source).toContain("clearTriggerRef = useRef(null)");
    expect(source).toContain("cancelClearRef = useRef(null)");

    const triggerButton = sliceBetween("<button", "</button>");
    expect(triggerButton).toContain("ref={clearTriggerRef}");

    const cancelHandlerAttr = source.indexOf("onClick={handleCancelClear}");
    expect(cancelHandlerAttr, "expected to find the cancel button's onClick").toBeGreaterThanOrEqual(0);
    const cancelButtonStart = source.lastIndexOf("<button", cancelHandlerAttr);
    const cancelButtonMarkup = source.slice(cancelButtonStart, source.indexOf(">", cancelHandlerAttr) + 1);
    expect(cancelButtonMarkup).toContain("ref={cancelClearRef}");
  });

  it("moves focus to the safe cancel action when the dialog opens", () => {
    const openEffect = sliceBetween("useEffect(() => {", "}, [confirmingClear]);");
    expect(openEffect).toContain("if (confirmingClear)");
    expect(openEffect).toContain("cancelClearRef.current?.focus()");
  });

  it("restores focus to the trigger on cancel, and clears the confirmation flag", () => {
    const cancelHandler = functionBody("handleCancelClear");
    expect(cancelHandler).toContain("setConfirmingClear(false)");
    expect(cancelHandler).toContain("clearTriggerRef.current?.focus()");
  });

  it("never attempts to restore focus to the trigger on confirm", () => {
    const confirmHandler = functionBody("handleConfirmClear");
    expect(confirmHandler).toContain("setConfirmingClear(false)");
    expect(confirmHandler).toContain("onClearHistory()");
    expect(confirmHandler).not.toContain("focus()");
  });

  it("gates the confirmation UI behind the local confirmingClear flag, not a Redux/localStorage read", () => {
    expect(source).toContain("useState(false)");
    expect(source).not.toMatch(/useSelector|useDispatch|localStorage/);
  });
});
