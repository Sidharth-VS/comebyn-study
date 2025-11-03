"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Brain, Plus, Trash2, BookOpen, Calendar, Target } from "lucide-react";
import Link from "next/link";
import { getFlashcardSets, deleteFlashcardSet, getFlashcardSet, type FlashcardSet } from "@/src/services/flashcardServices";

export const FlashcardLibraryView = () => {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadFlashcardSets();
  }, []);

  const loadFlashcardSets = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getFlashcardSets();
      if (result.success && result.sets) {
        setFlashcardSets(result.sets);
      } else {
        setError(result.error || "Failed to load flashcard sets");
      }
    } catch (err) {
      console.error("Failed to load flashcard sets:", err);
      setError("Failed to load flashcard sets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (setId: string) => {
    if (!confirm("Are you sure you want to delete this flashcard set?")) {
      return;
    }

    try {
      const result = await deleteFlashcardSet(setId);
      if (result.success) {
        setFlashcardSets(flashcardSets.filter(set => set.id !== setId));
      } else {
        alert("Failed to delete flashcard set");
      }
    } catch (err) {
      console.error("Failed to delete flashcard set:", err);
      alert("Failed to delete flashcard set");
    }
  };

  const handleStudy = async (setId: string) => {
    try {
      const result = await getFlashcardSet(setId);
      if (result.success && result.set) {
        // Store in sessionStorage for study view
        sessionStorage.setItem('generatedFlashcards', JSON.stringify({
          flashcards: result.set.flashcards,
          fileName: result.set.sourcePdf || result.set.title,
          difficulty: result.set.difficulty,
          topicFocus: result.set.topicFocus
        }));
        sessionStorage.setItem('currentFlashcardSetId', setId);
        router.push('/flashcards/study');
      }
    } catch (err) {
      console.error("Failed to load flashcard set:", err);
      alert("Failed to load flashcard set");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Flashcard Library</h1>
                </div>
              </div>
            </div>

            <Link href="/flashcards/generate">
              <Button className="flex items-center space-x-2 bg-[#8056c3] hover:bg-[#6232ae]">
                <Plus className="w-4 h-4" />
                <span>Create New Set</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text">
              Your Flashcard Sets
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Review your saved flashcard sets and continue studying where you left off.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-center">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && flashcardSets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Flashcard Sets Yet</h3>
              <p className="text-gray-600 mb-6">Create your first flashcard set to start studying</p>
              <Link href="/flashcards/generate">
                <Button className="bg-[#8056c3] hover:bg-[#6232ae]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Flashcard Set
                </Button>
              </Link>
            </div>
          )}

          {/* Flashcard Sets Grid */}
          {!loading && !error && flashcardSets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcardSets.map((set) => (
                <div
                  key={set.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {set.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white capitalize">
                        {set.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                        {set.totalCards} Cards
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {set.sourcePdf && (
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{set.sourcePdf}</span>
                      </div>
                    )}

                    {set.topicFocus && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">Focus: {set.topicFocus}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Created {formatDate(set.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => handleStudy(set.id)}
                        className="flex-1 bg-[#8056c3] hover:bg-[#6232ae] text-white"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Study
                      </Button>
                      <Button
                        onClick={() => handleDelete(set.id)}
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
