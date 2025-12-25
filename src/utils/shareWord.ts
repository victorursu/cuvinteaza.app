import { Share } from "react-native";
import type { VocabularyWord } from "../types";

/**
 * Strips HTML tags from a string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Formats a word for sharing
 */
export function formatWordForShare(word: VocabularyWord): string {
  // Get first example if available
  const firstExample = word.examples.length > 0 
    ? `\n\nExemplu: ${stripHtml(word.examples[0])}`
    : "";

  return `${word.title}\n${word.grammar_block}\n\n${word.definition}${firstExample}\n\n------------\nDacă ți-a plăcut acest cuvânt, te așteaptă multe altele în aplicația Cuvintești și pe cuvintesti.ro.`;
}

/**
 * Shares a word using the native share dialog
 */
export async function shareWord(word: VocabularyWord): Promise<void> {
  try {
    const shareText = formatWordForShare(word);
    await Share.share({
      message: shareText,
      title: word.title,
    });
  } catch (error) {
    // Share dialog was dismissed or error occurred
    console.error("Error sharing word:", error);
  }
}

