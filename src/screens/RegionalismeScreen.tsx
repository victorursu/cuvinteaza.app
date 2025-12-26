import { useEffect, useState, useCallback } from "react";
import { REGIONALISME_COUNT } from "../config";
import { DictionaryScreen } from "./DictionaryScreen";
import { fetchRegionalismeFromSupabase } from "../api/supabase-words";
import type { VocabularyWord } from "../types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function RegionalismeScreen() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wordsFromSupabase, setWordsFromSupabase] = useState(false);

  const loadWords = useCallback(async () => {
    setIsLoading(true);
    setWordsFromSupabase(false);
    
    // First, test if Supabase is accessible
    if (!isSupabaseConfigured || !supabase) {
      console.error("[Regionalisme] Supabase is not configured");
      setWords([]);
      setIsLoading(false);
      return;
    }

    try {
      // Try to fetch from Supabase
      const supabaseWords = await fetchRegionalismeFromSupabase(REGIONALISME_COUNT);
      
      if (supabaseWords.length > 0) {
        setWords(supabaseWords);
        setWordsFromSupabase(true);
      } else {
        setWords([]);
        setWordsFromSupabase(false);
      }
    } catch (supabaseError: any) {
      console.error("[Regionalisme] Failed to fetch from Supabase:", supabaseError);
      setWords([]);
      setWordsFromSupabase(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWords();
  }, [loadWords]);

  // Pass empty array while loading to indicate we're still loading (not undefined)
  // This prevents DictionaryScreen from using fallback immediately
  const wordsToPass = isLoading && words.length === 0 ? [] : words;
  
  return (
    <DictionaryScreen
      title="Regionalisme"
      subtitle="expresii regionale din toată țara"
      url=""
      fallback={[]}
      preloadedWords={wordsToPass.length > 0 ? wordsToPass : undefined}
      onRefresh={() => {
        void loadWords();
      }}
    />
  );
}


