export type VocabularyWord = {
  title: string;
  grammar_block: string;
  definition: string;
  image: string;
  tags: string[];
  examples: string[];
};

export type VocabularyPayload = VocabularyWord[] | { words: VocabularyWord[] };


