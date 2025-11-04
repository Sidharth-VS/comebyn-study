"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, FileText, Brain, Settings2, Upload } from "lucide-react";
import Link from "next/link";
import { generateFlashcards } from "@/src/services/flashcardServices";

export const GenerateFlashcardsView = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [numCards, setNumCards] = useState<number>(10);
  const [topicFocus, setTopicFocus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Please upload a PDF file");
        setFile(null);
      }
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const responseData = await generateFlashcards(
        file,
        difficulty,
        numCards,
        topicFocus || undefined
      );

      if (responseData.flashcards && Array.isArray(responseData.flashcards)) {
        // Store flashcard data in sessionStorage and navigate to study page
        // For newly generated flashcards, use a temporary ID based on filename and timestamp
        const tempSetId = `temp_${Date.now()}`;
        sessionStorage.setItem(`flashcardSet_${tempSetId}`, JSON.stringify({
          flashcards: responseData.flashcards,
          fileName: file.name,
          difficulty,
          topicFocus
        }));
        sessionStorage.setItem('currentFlashcardSetId', tempSetId);
        // Navigate with setId parameter
        router.push(`/flashcards/study?setId=${tempSetId}`);
      } else {
        throw new Error("No flashcards found in the response");
      }
    } catch (err) {
      console.error("Flashcard generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#efeee5]">
      {/* Enhanced Header */}
      <header className="bg-[#f9f8f0] backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-[#1F2937] hover:text-[#1F2937] transition-colors hover:bg-gray-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-xl shadow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#1F2937]">AI Flashcard Generator</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {file && (
                <div className="flex items-center space-x-2 text-sm text-[#0C4A6E] bg-[#E0F2FE] px-3 py-1.5 rounded-lg border border-[#06B6D4]">
                  <FileText className="w-4 h-4 text-[#06B6D4]" />
                  <span className="font-medium">{file.name}</span>
                  <div className="w-2 h-2 bg-[#06B6D4] rounded-full animate-pulse"></div>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-[#1F2937] bg-[#f5f3f0] px-3 py-1.5 rounded-lg border border-gray-200">
                <Settings2 className="w-4 h-4" />
                <span className="capitalize font-medium">{difficulty}</span>
                <span>•</span>
                <span className="font-medium">{numCards} Cards</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-[#f9f8f0] rounded-2xl shadow-lg mb-6 border border-[#06B6D4]">
              <Brain className="w-10 h-10 text-[#7C3AED]" />
            </div>
            <h1 className="text-4xl md:text-3xl font-bold text-[#1F2937] mb-4">
              Generate Flashcards
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Upload a PDF document and generate smart flashcards with concept definitions and Q&A cards for effective studying.
            </p>
          </div>

          {/* Flashcard Generation Form */}
          <div className="bg-[#f9f8f0] rounded-2xl shadow-lg p-8 border border-t-4 border-t-[#06B6D4] border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <div className="lg:col-span-2">
                <label className="block text-lg font-semibold text-[#1F2937] mb-4">
                  Upload PDF Document
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#06B6D4] rounded-2xl cursor-pointer bg-[#E0F2FE]/50 hover:bg-[#E0F2FE] transition-all duration-200 hover:border-[#06B6D4]">
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      <Upload className="w-12 h-12 mb-3 text-[#7C3AED]" />
                      <p className="mb-1 text-base text-[#1F2937] font-medium">
                        <span className="text-[#7C3AED]">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">PDF files only (max. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {file && (
                  <div className="mt-4 p-4 bg-[#E0F2FE] border border-[#06B6D4] rounded-xl">
                    <p className="text-[#0C4A6E] font-medium flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Selected: {file.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-[#1F2937]">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors text-base font-medium text-[#1F2937]"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Number of Cards */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-[#1F2937]">
                  Number of Cards
                </label>
                <select
                  value={numCards}
                  onChange={(e) => setNumCards(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors text-base font-medium text-[#1F2937]"
                >
                  <option value={5}>5 Cards</option>
                  <option value={10}>10 Cards</option>
                  <option value={15}>15 Cards</option>
                  <option value={20}>20 Cards</option>
                  <option value={30}>30 Cards</option>
                </select>
              </div>

              {/* Topic Focus */}
              <div className="lg:col-span-2 space-y-3">
                <label className="block text-base font-semibold text-[#1F2937]">
                  Topic Focus (Optional)
                </label>
                <input
                  type="text"
                  value={topicFocus}
                  onChange={(e) => setTopicFocus(e.target.value)}
                  placeholder="e.g., photosynthesis, World War II, quantum mechanics"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors text-base text-[#1F2937]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Specify a particular topic to focus on from the document
                </p>
              </div>

              {/* Generate Button */}
              <div className="lg:col-span-2">
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={loading || !file}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 px-6 rounded-xl font-bold text-lg focus:ring-4 focus:ring-[#7C3AED]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                      Generating Flashcards...
                    </>
                  ) : (
                    "Generate Flashcards"
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-700 font-medium text-base">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
