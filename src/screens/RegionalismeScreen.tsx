import { useEffect, useState, useCallback } from "react";
import fallbackRegionalisme from "../data/fallbackRegionalisme.ro.json";
import { REGIONALISME_COUNT } from "../config";
import { DictionaryScreen } from "./DictionaryScreen";
import { fetchRegionalismeFromSupabase } from "../api/supabase-words";
import { parseVocabulary } from "../api/vocabulary";
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
      // Fall through to use fallback
    } else {
      try {
        // Try to fetch from Supabase
        const supabaseWords = await fetchRegionalismeFromSupabase(REGIONALISME_COUNT);
        
        if (supabaseWords.length > 0) {
          setWords(supabaseWords);
          setWordsFromSupabase(true);
          setIsLoading(false);
          return;
        }
      } catch (supabaseError: any) {
        console.error("[Regionalisme] Failed to fetch from Supabase:", supabaseError);
        // Fall through to fallback
      }
    }

    // Fallback to local JSON if Supabase fails or returns no words
    try {
      const fallbackWords = parseVocabulary(fallbackRegionalisme);
      setWords(fallbackWords);
      setWordsFromSupabase(false);
    } catch (error) {
      console.error("[Regionalisme] Error parsing fallback:", error);
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
      url="" // Always empty - we handle loading in RegionalismeScreen
      fallback={fallbackRegionalisme as unknown}
      preloadedWords={wordsToPass.length > 0 ? wordsToPass : undefined}
      onRefresh={() => {
        void loadWords();
      }}
    />
  );
}


