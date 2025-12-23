import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useLikes() {
  const [likedWordIds, setLikedWordIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Get current session
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    void getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load likes from Supabase when session changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    if (!session?.user) {
      setLikedWordIds(new Set());
      setIsLoading(false);
      return;
    }

    const loadLikes = async () => {
      try {
        const { data, error } = await supabase
          .from("cuvinteziLikes")
          .select("word_id")
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Failed to load likes:", error);
          setIsLoading(false);
          return;
        }

        const ids = new Set(data?.map((row) => row.word_id) || []);
        setLikedWordIds(ids);
      } catch (error) {
        console.error("Failed to load likes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadLikes();
  }, [session]);

  const toggleLike = useCallback(
    async (wordId: string) => {
      if (!isSupabaseConfigured || !supabase) {
        console.warn("Supabase not configured");
        return;
      }

      if (!session?.user) {
        console.warn("User not authenticated");
        return;
      }

      // Use functional update to get current state
      let isCurrentlyLiked = false;
      setLikedWordIds((prev) => {
        isCurrentlyLiked = prev.has(wordId);
        const next = new Set(prev);
        if (isCurrentlyLiked) {
          next.delete(wordId);
        } else {
          next.add(wordId);
        }
        return next;
      });

      try {
        if (isCurrentlyLiked) {
          // Delete the like record
          const { error } = await supabase
            .from("cuvinteziLikes")
            .delete()
            .eq("user_id", session.user.id)
            .eq("word_id", wordId);

          if (error) {
            throw error;
          }
        } else {
          // Create a new like record
          const { error } = await supabase.from("cuvinteziLikes").insert({
            user_id: session.user.id,
            word_id: wordId,
          });

          if (error) {
            throw error;
          }
        }
      } catch (error) {
        // Revert optimistic update on error
        setLikedWordIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyLiked) {
            next.add(wordId);
          } else {
            next.delete(wordId);
          }
          return next;
        });
        console.error("Failed to toggle like:", error);
      }
    },
    [session]
  );

  const isLiked = useCallback(
    (wordId: string) => {
      return likedWordIds.has(wordId);
    },
    [likedWordIds]
  );

  return { isLiked, toggleLike, isLoading, isAuthenticated: !!session?.user };
}

