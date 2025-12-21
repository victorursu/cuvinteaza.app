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


