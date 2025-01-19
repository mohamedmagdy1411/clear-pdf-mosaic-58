import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
}

const QuizModal = ({ isOpen, onClose, questions }: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(true);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const isCorrect = selectedAnswer === currentQuestionData?.correctIndex;

  if (!currentQuestionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Question {currentQuestion + 1} of {questions.length}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-lg font-medium">{currentQuestionData.question}</p>
          <div className="space-y-2">
            {currentQuestionData.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left",
                  selectedAnswer === index && (
                    isCorrect ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"
                  )
                )}
                onClick={() => handleAnswerSelect(index)}
              >
                {option}
              </Button>
            ))}
          </div>

          {showExplanation && selectedAnswer !== undefined && (
            <div className={cn(
              "p-4 rounded-md mt-4",
              isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            )}>
              <p className="font-medium mb-2">
                {isCorrect ? "Correct!" : "Incorrect"}
              </p>
              {currentQuestionData.explanation && (
                <p>{currentQuestionData.explanation}</p>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestion === questions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;