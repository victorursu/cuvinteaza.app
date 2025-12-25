import { useEffect, useState, useCallback } from "react";
import fallbackUrbanisme from "../data/fallbackUrbanisme.ro.json";
import { URBANISME_COUNT } from "../config";
import { DictionaryScreen } from "./DictionaryScreen";
import { fetchUrbanismeFromSupabase } from "../api/supabase-words";
import { parseVocabulary } from "../api/vocabulary";
import type { VocabularyWord } from "../types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function UrbanismeScreen() {
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
        const supabaseWords = await fetchUrbanismeFromSupabase(URBANISME_COUNT);
        
        if (supabaseWords.length > 0) {
          setWords(supabaseWords);
          setWordsFromSupabase(true);
          setIsLoading(false);
          return;
        }
      } catch (supabaseError: any) {
        console.error("[Urbanisme] Failed to fetch from Supabase:", supabaseError);
        // Fall through to fallback
      }
    }

    // Fallback to local JSON if Supabase fails or returns no words
    try {
      const fallbackWords = parseVocabulary(fallbackUrbanisme);
      setWords(fallbackWords);
      setWordsFromSupabase(false);
    } catch (error) {
      console.error("[Urbanisme] Error parsing fallback:", error);
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
        title="Urbanisme"
        subtitle="limbaj urban"
        url="" // Always empty - we handle loading in UrbanismeScreen
        fallback={fallbackUrbanisme as unknown}
        preloadedWords={wordsToPass.length > 0 ? wordsToPass : undefined}
        onRefresh={() => {
          console.log("[Urbanisme] Refresh button clicked, reloading words...");
          void loadWords();
        }}
      />
  );
}


