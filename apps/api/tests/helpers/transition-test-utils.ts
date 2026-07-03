type TransitionMap = Record<string, string[]>;

const ALL_STATUSES = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "SIGNED",
  "DECLINED",
  "CANCELED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "VOID",
] as const;

export function allStatusesInMap(transitions: TransitionMap): string[] {
  const statuses = new Set<string>();

  for (const [current, nextStates] of Object.entries(transitions)) {
    statuses.add(current);
    for (const next of nextStates) {
      statuses.add(next);
    }
  }

  return [...statuses];
}

export function validTransitions(transitions: TransitionMap): Array<{
  current: string;
  next: string;
}> {
  return Object.entries(transitions).flatMap(([current, nextStates]) =>
    nextStates.map((next) => ({ current, next })),
  );
}

export function invalidTransitions(transitions: TransitionMap): Array<{
  current: string;
  next: string;
}> {
  const invalid: Array<{ current: string; next: string }> = [];

  for (const current of Object.keys(transitions)) {
    const allowed = new Set(transitions[current]);

    for (const next of ALL_STATUSES) {
      if (!allowed.has(next)) {
        invalid.push({ current, next });
      }
    }
  }

  return invalid;
}
