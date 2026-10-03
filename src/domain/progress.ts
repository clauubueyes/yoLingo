/** Ordered groups containing only lessons with available learning content.
 * Lesson IDs must be unique within a path; completed IDs belong to that path.
 */
export type LearningGroup = Readonly<{
  id: string;
  lessonIds: readonly string[];
}>;

export type LearningProgress = Readonly<{
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
}>;

/** Completion is cumulative, including when a lesson is repeated. */
export function completeLesson(
  completed: readonly string[],
  lessonId: string,
): readonly string[] {
  return [...new Set([...completed, lessonId])];
}

export function isLessonComplete(completed: readonly string[], lessonId: string): boolean {
  return completed.includes(lessonId);
}

function calculateProgress(
  lessonIds: readonly string[],
  completed: readonly string[],
): LearningProgress {
  const available = new Set(lessonIds);
  const completedIds = new Set(completed);
  const count = [...available].filter((id) => completedIds.has(id)).length;
  const total = available.size;

  return {
    completed: count,
    total,
    percentage: total === 0 ? 0 : (count / total) * 100,
    isComplete: total > 0 && count === total,
  };
}

export function getGroupProgress(
  group: LearningGroup,
  completed: readonly string[],
): LearningProgress {
  return calculateProgress(group.lessonIds, completed);
}

export function getPathProgress(
  groups: readonly LearningGroup[],
  completed: readonly string[],
): LearningProgress {
  return calculateProgress(groups.flatMap((group) => group.lessonIds), completed);
}

/** Empty groups are unavailable; preceding empty groups do not block real content. */
export function isGroupUnlocked(
  groups: readonly LearningGroup[],
  groupId: string,
  completed: readonly string[],
): boolean {
  const index = groups.findIndex((group) => group.id === groupId);
  if (index < 0 || groups[index].lessonIds.length === 0) return false;

  return groups.slice(0, index).every(
    (group) => group.lessonIds.length === 0 || getGroupProgress(group, completed).isComplete,
  );
}

/** First pending lesson in content order, rather than the successor of the last attempt. */
export function getNextLesson(
  groups: readonly LearningGroup[],
  completed: readonly string[],
): string | null {
  const completedIds = new Set(completed);
  for (const group of groups) {
    const next = group.lessonIds.find((id) => !completedIds.has(id));
    if (next !== undefined) return next;
  }
  return null;
}
