export type VocabularyWord = {
  id: string;
  title: string;
  grammar_block: string;
  definition: string;
  image: string;
  tags: string[];
  examples: string[];
};

export type VocabularyPayload = VocabularyWord[] | { words: VocabularyWord[] };

export type TestDifficulty = "easy" | "medium" | "hard";

export type TestQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_options: number[]; // indices into `options`
  difficulty: TestDifficulty;
  image: string; // background image URL
};

export type TestPayload = TestQuestion[] | { questions: TestQuestion[] };


