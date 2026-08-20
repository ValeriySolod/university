"use client";

// Small shared hook wrapping the markedQuestions slice, reused from an
// active NMT task (lib/useNmtSession.js), an active practice question
// (lib/useMathTrainer.js), and the /history page (lib/useAttemptHistory.js).
// No component reads or writes markedQuestions state directly.

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { questionMarked, questionUnmarked } from "./store/markedQuestionsSlice";

export function useMarkedQuestions() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.markedQuestions.items);

  const isMarked = useCallback((questionId) => items.some((item) => item.questionId === questionId), [items]);

  const mark = useCallback(
    ({ questionId, questionSnapshot, category = null, sourceAttemptId = null }) => {
      dispatch(questionMarked({ questionId, questionSnapshot, category, sourceAttemptId, markedAt: Date.now() }));
    },
    [dispatch]
  );

  const unmark = useCallback((questionId) => dispatch(questionUnmarked({ questionId })), [dispatch]);

  const toggleMark = useCallback(
    ({ questionId, questionSnapshot, category = null, sourceAttemptId = null }) => {
      if (isMarked(questionId)) {
        unmark(questionId);
      } else {
        mark({ questionId, questionSnapshot, category, sourceAttemptId });
      }
    },
    [isMarked, mark, unmark]
  );

  return { items, isMarked, mark, unmark, toggleMark };
}
