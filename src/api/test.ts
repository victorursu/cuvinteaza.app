import type { TestDifficulty, TestQuestion } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDifficulty(value: unknown): value is TestDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function isTestQuestion(value: unknown): value is TestQuestion {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.question === "string" &&
    Array.isArray(value.options) &&
    value.options.every((o) => typeof o === "string") &&
    Array.isArray(value.correct_options) &&
    value.correct_options.every((i) => Number.isInteger(i)) &&
    isDifficulty(value.difficulty) &&
    typeof value.image === "string"
  );
}

export function parseTest(data: unknown): TestQuestion[] {
  let questions: unknown[] | undefined;
  if (Array.isArray(data)) questions = data;
  else if (isRecord(data) && Array.isArray(data.questions)) questions = data.questions;
  else throw new Error("Invalid test JSON shape");

  if (!questions.every(isTestQuestion)) {
    throw new Error("Invalid test question entries");
  }

  // Sanity: correct option indices must be within range
  for (const q of questions) {
    if (q.options.length < 2) throw new Error(`Question ${q.id} has too few options`);
    if (q.correct_options.length < 1) throw new Error(`Question ${q.id} has no correct options`);
    if (q.correct_options.some((idx) => idx < 0 || idx >= q.options.length)) {
      throw new Error(`Question ${q.id} has out-of-range correct option index`);
    }
  }

  return questions;
}

export async function fetchTest(url: string): Promise<TestQuestion[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load test (${res.status})`);
  const data: unknown = await res.json();
  return parseTest(data);
}






