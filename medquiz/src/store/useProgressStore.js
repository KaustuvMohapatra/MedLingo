import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../hooks/useAuth";

function sm2(card = {}, quality) {
  const q = Math.max(1, Math.min(5, quality));
  let ef = card.easeFactor   ?? 2.5;
  let iv = card.interval     ?? 1;
  let rp = card.repetitions  ?? 0;
  if (q >= 3) {
    if      (rp === 0) iv = 1;
    else if (rp === 1) iv = 6;
    else               iv = Math.round(iv * ef);
    rp += 1;
    ef = Math.max(1.3, ef + 0.1 - (5-q)*(0.08+(5-q)*0.02));
  } else { rp = 0; iv = 1; }
  const next = new Date();
  next.setDate(next.getDate() + iv);
  return { easeFactor:ef, interval:iv, repetitions:rp, nextReview:next.toISOString() };
}

// Debounce helper
let syncTimer = null;
const debouncedSync = (fn, ms = 1500) => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(fn, ms);
};

const useProgressStore = create(
  persist(
    (set, get) => ({
      xp: 0, hearts: 5, streak: 0,
      completedTopics: [],
      cards: {},
      userId: null,

      // ── Set user (called after login) ──
      setUserId: async (uid) => {
        set({ userId: uid });
        if (!uid) return;
        // Load from Supabase
        const [{ data: prog }, { data: completed }, { data: cards }] = await Promise.all([
          supabase.from("user_progress").select("*").eq("id", uid).single(),
          supabase.from("user_completed").select("topic_key").eq("id", uid),
          supabase.from("user_cards").select("*").eq("id", uid),
        ]);
        if (prog) {
          set({ xp: prog.xp ?? 0, hearts: prog.hearts ?? 5, streak: prog.streak ?? 0 });
        }
        if (completed) {
          set({ completedTopics: completed.map(r => r.topic_key) });
        }
        if (cards) {
          const cardMap = {};
          cards.forEach(c => {
            cardMap[c.question_id] = {
              easeFactor: c.ease_factor, interval: c.interval_days,
              repetitions: c.repetitions, nextReview: c.next_review,
            };
          });
          set({ cards: cardMap });
        }
      },

      // ── Sync to Supabase ──
      _syncProgress: () => {
        const { userId, xp, hearts, streak } = get();
        if (!userId) return;
        debouncedSync(() => {
          supabase.from("user_progress").upsert({
            id: userId, xp, hearts, streak,
            last_active: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
          });
        });
      },

      // ── Actions ──
      addXp: (amount) => {
        set(s => ({ xp: s.xp + amount }));
        get()._syncProgress();
      },
      loseHeart: () => {
        set(s => ({ hearts: Math.max(0, s.hearts - 1) }));
        get()._syncProgress();
      },
      gainHeart: () => {
        set(s => ({ hearts: Math.min(5, s.hearts + 1) }));
        get()._syncProgress();
      },
      incrementStreak: () => {
        set(s => ({ streak: s.streak + 1 }));
        get()._syncProgress();
      },
      resetStreak: () => { set({ streak: 0 }); get()._syncProgress(); },

      markTopicComplete: async (key) => {
        const { completedTopics, userId } = get();
        if (completedTopics.includes(key)) return;
        set({ completedTopics: [...completedTopics, key] });
        if (userId) {
          await supabase.from("user_completed").upsert({ id: userId, topic_key: key });
        }
      },

      reviewCard: async (questionId, quality) => {
        const { cards, userId } = get();
        const updated = sm2(cards[questionId], quality);
        set({ cards: { ...cards, [questionId]: updated } });
        if (userId) {
          await supabase.from("user_cards").upsert({
            id: userId, question_id: questionId,
            ease_factor: updated.easeFactor,
            interval_days: updated.interval,
            repetitions: updated.repetitions,
            next_review: updated.nextReview?.split("T")[0],
            updated_at: new Date().toISOString(),
          });
        }
      },

      resetProgress: () => {
        set({ xp:0, hearts:5, streak:0, completedTopics:[], cards:{} });
        const { userId } = get();
        if (userId) {
          supabase.from("user_progress").upsert({ id:userId, xp:0, hearts:5, streak:0 });
          supabase.from("user_completed").delete().eq("id", userId);
          supabase.from("user_cards").delete().eq("id", userId);
        }
      },
    }),
    { name: "medquest-progress" }
  )
);

export default useProgressStore;
