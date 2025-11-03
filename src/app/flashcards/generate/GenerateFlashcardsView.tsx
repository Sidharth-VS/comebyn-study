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
        sessionStorage.setItem('generatedFlashcards', JSON.stringify({
          flashcards: responseData.flashcards,
          fileName: file.name,
          difficulty,
          topicFocus
        }));
        router.push('/flashcards/study');
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
    <div className="min-h-screen bg-gradient-to-br bg-indigo-50">
      {/* Enhanced Header */}
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
                  <h1 className="text-lg font-bold text-gray-900">AI Flashcard Generator</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {file && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700">{file.name}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
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
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">
              <Brain className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text">
              Generate Flashcards
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Upload a PDF document and generate smart flashcards with concept definitions and Q&A cards for effective studying.
            </p>
          </div>

          {/* Flashcard Generation Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <div className="lg:col-span-2">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Upload PDF Document
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200 hover:border-gray-400">
                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                      <Upload className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="mb-1 text-base text-gray-500 font-medium">
                        <span className="text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-gray-400">PDF files only (max. 10MB)</p>
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
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 font-medium flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Selected: {file.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-900">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base font-medium"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Number of Cards */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-900">
                  Number of Cards
                </label>
                <select
                  value={numCards}
                  onChange={(e) => setNumCards(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base font-medium"
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
                <label className="block text-base font-semibold text-gray-900">
                  Topic Focus (Optional)
                </label>
                <input
                  type="text"
                  value={topicFocus}
                  onChange={(e) => setTopicFocus(e.target.value)}
                  placeholder="e.g., photosynthesis, World War II, quantum mechanics"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
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
                  className="w-full bg-gradient-to-br bg-[#8056c3] hover:bg-[#6232ae] text-white py-4 px-6 rounded-xl font-bold text-lg focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
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
