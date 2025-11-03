export type FlashcardType = 'concept' | 'qa';

export type Flashcard = {
  id?: string;
  setId?: string;
  type: FlashcardType;
  frontContent: string;
  backContent: string;
  order: number;
};

export type FlashcardSet = {
  id: string;
  userId: string;
  title: string;
  sourcePdf?: string;
  difficulty: string;
  topicFocus?: string;
  totalCards: number;
  createdAt: Date;
  updatedAt: Date;
  flashcards?: Flashcard[];
};

export type FlashcardProgress = {
  id: string;
  userId: string;
  cardId: string;
  status: 'new' | 'learning' | 'known';
  masteryLevel: number;
  lastReviewed?: Date;
  reviewCount: number;
};

export type GenerateFlashcardsResponse = {
  flashcards: Flashcard[];
  total_cards: number;
  metadata: {
    generated_at: string;
    source: string;
  };
};

// Generate flashcards from PDF
export const generateFlashcards = async (
  file: File,
  difficulty: string,
  numCards: number,
  topicFocus?: string
): Promise<GenerateFlashcardsResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("difficulty", difficulty);
    formData.append("num_cards", numCards.toString());
    if (topicFocus) {
      formData.append("topic_focus", topicFocus);
    }

    const res = await fetch("/api/flashcards/generate", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${res.status}`);
    }

    const responseData: GenerateFlashcardsResponse = await res.json();
    console.log("Flashcards generated:", responseData);

    return responseData;
  } catch (error) {
    console.error("❌ Flashcard Generation failed:", error);
    throw error;
  }
};

// Save flashcard set to database
export const saveFlashcardSet = async (
  title: string,
  flashcards: Flashcard[],
  difficulty: string,
  sourcePdf?: string,
  topicFocus?: string
): Promise<{ success: boolean; setId?: string; error?: string }> => {
  try {
    const res = await fetch("/api/flashcards/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        flashcards,
        difficulty,
        sourcePdf,
        topicFocus,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, setId: data.setId };
  } catch (error) {
    console.error("❌ Save flashcard set failed:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Get all flashcard sets for current user
export const getFlashcardSets = async (): Promise<{
  success: boolean;
  sets?: FlashcardSet[];
  error?: string;
}> => {
  try {
    const res = await fetch("/api/flashcards/list", {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, sets: data.sets };
  } catch (error) {
    console.error("❌ Fetch flashcard sets failed:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Get specific flashcard set with all cards
export const getFlashcardSet = async (
  setId: string
): Promise<{ success: boolean; set?: FlashcardSet; error?: string }> => {
  try {
    const res = await fetch(`/api/flashcards/${setId}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, set: data.set };
  } catch (error) {
    console.error("❌ Fetch flashcard set failed:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Delete a flashcard set
export const deleteFlashcardSet = async (
  setId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/flashcards/${setId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${res.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Delete flashcard set failed:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Update card progress
export const updateCardProgress = async (
  cardId: string,
  status: 'new' | 'learning' | 'known',
  masteryLevel: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch("/api/flashcards/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardId,
        status,
        masteryLevel,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${res.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Update card progress failed:", error);
    return { success: false, error: (error as Error).message };
  }
};

// Get progress for a specific set
export const getSetProgress = async (
  setId: string
): Promise<{
  success: boolean;
  progress?: { [cardId: string]: FlashcardProgress };
  error?: string;
}> => {
  try {
    const res = await fetch(`/api/flashcards/progress?setId=${setId}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, progress: data.progress };
  } catch (error) {
    console.error("❌ Fetch set progress failed:", error);
    return { success: false, error: (error as Error).message };
  }
};
