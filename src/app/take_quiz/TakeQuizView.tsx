"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Brain } from "lucide-react";
import Link from "next/link";
import { QuizQuestion } from "@/src/services/pdfServices";

export const TakeQuizView = () => {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load quiz data from sessionStorage
    const storedQuiz = sessionStorage.getItem('generatedQuiz');
    if (storedQuiz) {
      setQuiz(JSON.parse(storedQuiz));
    }
    setLoading(false);
  }, []);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.forEach((question) => {
      if (userAnswers[question.id!] === question.answer) {
        correct++;
      }
    });
    return correct;
  };

  const handleGenerateNewQuiz = () => {
    sessionStorage.removeItem('generatedQuiz');
    router.push('/generate_quiz');
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const questionOptions = question.options || [];

    return (
      <div key={question.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
            {index + 1}. {question.question}
          </h3>
          <span className="ml-4 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize shrink-0">
            Multiple Choice
          </span>
        </div>

        <div className="space-y-3">
          {questionOptions.length > 0 ? (
            questionOptions.map((option, optionIndex) => {
              const optionLetter = String.fromCharCode(65 + optionIndex);
              const isOptionSelected = userAnswers[question.id!] === optionLetter;
              const isOptionCorrect = optionLetter === question.answer;

              let optionClass = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ";

              if (submitted) {
                if (isOptionCorrect) {
                  optionClass += "bg-green-50 border-green-300 text-green-900 shadow-sm";
                } else if (isOptionSelected && !isOptionCorrect) {
                  optionClass += "bg-red-50 border-red-300 text-red-900 shadow-sm";
                } else {
                  optionClass += "bg-gray-50 border-gray-200 text-gray-600";
                }
              } else {
                optionClass += isOptionSelected
                  ? "bg-blue-50 border-blue-300 text-blue-900 shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 cursor-pointer shadow-sm";
              }

              return (
                <div
                  key={optionIndex}
                  className={optionClass}
                  onClick={() =>
                    !submitted && handleAnswerSelect(question.id!, optionLetter)
                  }
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 border-2 rounded-full mr-4 flex items-center justify-center transition-colors ${
                        submitted
                          ? isOptionCorrect
                            ? "bg-green-500 border-green-500"
                            : isOptionSelected
                            ? "bg-red-500 border-red-500"
                            : "border-gray-400 bg-white"
                          : isOptionSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {isOptionSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium mr-3 text-base">{optionLetter}.</span>
                    <span className="text-base flex-1">{option}</span>
                    {submitted && isOptionCorrect && (
                      <span className="ml-3 text-green-600 font-semibold text-sm flex items-center">
                        ✓ Correct
                      </span>
                    )}
                    {submitted && isOptionSelected && !isOptionCorrect && (
                      <span className="ml-3 text-red-600 font-semibold text-sm flex items-center">
                        ✗ Incorrect
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                No options available for this question.
              </p>
            </div>
          )}
        </div>

        {submitted && question.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong className="text-blue-900">Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Quiz Found</h2>
            <p className="text-gray-600 mb-6">Please generate a quiz first.</p>
            <Button onClick={() => router.push('/generate-quiz')}>
              Generate New Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Take Quiz</h1>
                  <p className="text-xs text-gray-500 font-medium">{quiz.length} Questions</p>
                </div>
              </div>
            </div>

            {submitted && (
              <div className="flex items-center space-x-2 text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">
                    Completed • {calculateScore()}/{quiz.length} correct
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              MCQ Quiz
            </h1>
            <p className="text-lg text-gray-600">
              Test your knowledge with {quiz.length} multiple choice questions
            </p>
          </div>

          {/* Quiz Display */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Questions
                </h2>
                <p className="text-gray-600 mt-1">
                  {submitted ? 
                    `You scored ${calculateScore()} out of ${quiz.length}` : 
                    `Answer all ${quiz.length} questions`
                  }
                </p>
              </div>
              <div className="flex gap-3">
                {!submitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length !== quiz.length}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateNewQuiz}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl text-base"
                  >
                    Generate New Quiz
                  </button>
                )}
              </div>
            </div>

            {submitted && (
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-2xl">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  Quiz Results
                </h3>
                <p className="text-blue-800 text-lg font-semibold">
                  {calculateScore()} out of {quiz.length} correct •{" "}
                  {Math.round((calculateScore() / quiz.length) * 100)}% Score
                </p>
              </div>
            )}

            <div className="space-y-8">
              {quiz.map((question, index) => renderQuestion(question, index))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}