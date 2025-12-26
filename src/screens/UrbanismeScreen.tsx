import { useEffect, useState, useCallback } from "react";
import { URBANISME_COUNT } from "../config";
import { DictionaryScreen } from "./DictionaryScreen";
import { fetchUrbanismeFromSupabase } from "../api/supabase-words";
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
      console.error("[Urbanisme] Supabase is not configured");
      setWords([]);
      setIsLoading(false);
      return;
    }

    try {
      // Try to fetch from Supabase
      const supabaseWords = await fetchUrbanismeFromSupabase(URBANISME_COUNT);
      
      if (supabaseWords.length > 0) {
        setWords(supabaseWords);
        setWordsFromSupabase(true);
      } else {
        setWords([]);
        setWordsFromSupabase(false);
      }
    } catch (supabaseError: any) {
      console.error("[Urbanisme] Failed to fetch from Supabase:", supabaseError);
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
        url=""
        fallback={[]}
        preloadedWords={wordsToPass.length > 0 ? wordsToPass : undefined}
        onRefresh={() => {
          console.log("[Urbanisme] Refresh button clicked, reloading words...");
          void loadWords();
        }}
      />
  );
}


