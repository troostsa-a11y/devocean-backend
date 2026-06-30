export type ReadinessState =
  | { status: "starting" }
  | { status: "ready" }
  | { status: "failed"; error: unknown };

let state: ReadinessState = { status: "starting" };

export function getReadiness(): ReadinessState {
  return state;
}

export function setReady(): void {
  state = { status: "ready" };
}

export function setFailed(error: unknown): void {
  state = { status: "failed", error };
}
