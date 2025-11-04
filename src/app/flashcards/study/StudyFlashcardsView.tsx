"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Brain, Check, X, Shuffle, Save, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FlashcardCard } from "@/src/components/flashcards/FlashcardCard";
import { saveFlashcardSet, updateCardProgress } from "@/src/services/flashcardServices";

type Flashcard = {
  id?: string;
  type: "concept" | "qa";
  frontContent?: string;
  backContent?: string;
  front?: string;
  back?: string;
  order: number;
};

type CardStatus = "new" | "learning" | "known";

export const StudyFlashcardsView = () => {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cardStatuses, setCardStatuses] = useState<{ [key: number]: CardStatus }>({});
  const [fileName, setFileName] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [topicFocus, setTopicFocus] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [setId, setSetId] = useState<string | null>(null);

  useEffect(() => {
    // Get setId from URL query params or sessionStorage
    const url = new URL(window.location.href);
    const urlSetId = url.searchParams.get('setId');

    let activeSetId = urlSetId || sessionStorage.getItem('currentFlashcardSetId');

    if (activeSetId) {
      setSetId(activeSetId);

      // Load flashcards from sessionStorage using setId as key
      const setKey = `flashcardSet_${activeSetId}`;
      const savedData = sessionStorage.getItem(setKey);

      if (savedData) {
        const data = JSON.parse(savedData);
        const normalizedCards = data.flashcards.map((card: any, index: number) => ({
          id: card.id,
          type: card.type,
          frontContent: card.frontContent || card.front,
          backContent: card.backContent || card.back,
          order: card.order !== undefined ? card.order : index,
        }));
        setFlashcards(normalizedCards);
        setFileName(data.fileName || "");
        setDifficulty(data.difficulty || "");
        setTopicFocus(data.topicFocus || "");
      }
    } else {
      // Fallback: load from old generatedFlashcards key for backward compatibility
      const savedData = sessionStorage.getItem('generatedFlashcards');
      if (savedData) {
        const data = JSON.parse(savedData);
        const normalizedCards = data.flashcards.map((card: any, index: number) => ({
          id: card.id,
          type: card.type,
          frontContent: card.frontContent || card.front,
          backContent: card.backContent || card.back,
          order: card.order !== undefined ? card.order : index,
        }));
        setFlashcards(normalizedCards);
        setFileName(data.fileName || "");
        setDifficulty(data.difficulty || "");
        setTopicFocus(data.topicFocus || "");
      }
    }
  }, []);

  const knownCount = Object.values(cardStatuses).filter(s => s === "known").length;
  const learningCount = Object.values(cardStatuses).filter(s => s === "learning").length;
  const newCount = flashcards.length - knownCount - learningCount;
  const progress = flashcards.length > 0 ? (knownCount / flashcards.length) * 100 : 0;

  const handleMarkKnown = async () => {
    const newStatuses = { ...cardStatuses, [currentIndex]: "known" as CardStatus };
    setCardStatuses(newStatuses);

    // Update progress in database if set is saved
    if (setId && flashcards[currentIndex]?.id) {
      await updateCardProgress(flashcards[currentIndex].id!, "known", 5);
    }

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkUnknown = async () => {
    const newStatuses = { ...cardStatuses, [currentIndex]: "learning" as CardStatus };
    setCardStatuses(newStatuses);

    // Update progress in database if set is saved
    if (setId && flashcards[currentIndex]?.id) {
      await updateCardProgress(flashcards[currentIndex].id!, "learning", 2);
    }

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
  };

  const handleSaveSet = async () => {
    if (!fileName || flashcards.length === 0) {
      return;
    }

    setSaving(true);
    try {
      const title = fileName.replace('.pdf', '') + ' Flashcards';
      const result = await saveFlashcardSet(
        title,
        flashcards,
        difficulty,
        fileName,
        topicFocus
      );

      if (result.success && result.setId) {
        setSetId(result.setId);
        sessionStorage.setItem('currentFlashcardSetId', result.setId);
        alert('Flashcard set saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save flashcard set:', err);
      alert('Failed to save flashcard set');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-[#efeee5] flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">No Flashcards Found</h2>
          <p className="text-gray-600 mb-6">Generate flashcards to start studying</p>
          <Link href="/flashcards/generate">
            <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
              Generate Flashcards
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const currentStatus = cardStatuses[currentIndex] || "new";

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#efeee5]">
      {/* Header */}
      <header className="bg-[#f9f8f0] backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/flashcards/library">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-[#1F2937] hover:text-[#1F2937] transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Library</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-xl shadow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#1F2937]">Study Flashcards</h1>
                  {fileName && <p className="text-xs text-gray-500">{fileName}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                className="flex items-center space-x-2 border-gray-300 text-[#1F2937] hover:bg-gray-100"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </Button>
              {!setId && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveSet}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Set"}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-[#f9f8f0] border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-[#1F2937]">Known: {knownCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-[#1F2937]">Learning: {learningCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="font-medium text-[#1F2937]">New: {newCount}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-[#1F2937]">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Card Counter */}
          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-[#1F2937]">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>

          {/* Flashcard */}
          <div className="mb-8">
            <FlashcardCard flashcard={currentCard} />
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Mark Known/Unknown */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleMarkUnknown}
                className="flex items-center space-x-2 px-8 py-6 text-lg bg-red-500 hover:bg-red-600 text-white"
                disabled={currentStatus === "learning"}
              >
                <X className="w-5 h-5" />
                <span>Still Learning</span>
              </Button>
              <Button
                onClick={handleMarkKnown}
                className="flex items-center space-x-2 px-8 py-6 text-lg bg-green-500 hover:bg-green-600 text-white"
                disabled={currentStatus === "known"}
              >
                <Check className="w-5 h-5" />
                <span>I Know This</span>
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 text-[#1F2937] hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="text-sm">
                {currentStatus === "known" && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Marked as Known
                  </span>
                )}
                {currentStatus === "learning" && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                    Still Learning
                  </span>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 text-[#1F2937] hover:bg-gray-100"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Completion Message */}
          {currentIndex === flashcards.length - 1 && knownCount === flashcards.length && (
            <div className="mt-12 text-center p-8 bg-green-50 border-2 border-green-200 rounded-2xl">
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-green-700">
                You've mastered all flashcards in this set!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
