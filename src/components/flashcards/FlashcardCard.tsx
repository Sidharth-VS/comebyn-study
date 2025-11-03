"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";

export type FlashcardData = {
  id?: string;
  type: "concept" | "qa";
  frontContent: string;
  backContent: string;
  order: number;
};

interface FlashcardCardProps {
  flashcard: FlashcardData;
  showTypeIndicator?: boolean;
}

export const FlashcardCard = ({ flashcard, showTypeIndicator = true }: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <div
        onClick={handleFlip}
        className="relative w-full cursor-pointer"
        style={{ minHeight: "320px" }}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 flex flex-col justify-center items-center backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {showTypeIndicator && (
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    flashcard.type === "concept"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  {flashcard.type === "concept" ? "Concept" : "Q&A"}
                </span>
              </div>
            )}

            <div className="text-center space-y-4 flex-1 flex flex-col justify-center">
              <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                {flashcard.frontContent}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-6">
              <RotateCw className="w-4 h-4" />
              <span className="font-medium">Click to flip</span>
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8 flex flex-col justify-center items-center backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {showTypeIndicator && (
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    flashcard.type === "concept"
                      ? "bg-blue-200 text-blue-800 border border-blue-300"
                      : "bg-purple-200 text-purple-800 border border-purple-300"
                  }`}
                >
                  {flashcard.type === "concept" ? "Definition" : "Answer"}
                </span>
              </div>
            )}

            <div className="text-center space-y-4 flex-1 flex flex-col justify-center">
              <p className="text-xl text-gray-800 leading-relaxed">
                {flashcard.backContent}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-6">
              <RotateCw className="w-4 h-4" />
              <span className="font-medium">Click to flip back</span>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};
