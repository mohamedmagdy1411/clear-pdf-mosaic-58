import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

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

const QuizModal = ({ isOpen, onClose, questions = [] }: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  if (!questions.length) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quiz</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>No questions available. Please try generating the quiz again.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === questions[currentQuestion]?.correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = isCorrect;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion]?.correctIndex) {
      setScore(score + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setShowFeedback(false);
    setAnswers([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {showResult ? "Quiz Results" : `Question ${currentQuestion + 1} of ${questions.length}`}
          </DialogTitle>
        </DialogHeader>

        {!showResult ? (
          <div className="space-y-6">
            <p className="text-lg font-medium">{questions[currentQuestion]?.question}</p>
            
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-3"
            >
              {questions[currentQuestion]?.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {showFeedback && selectedAnswer !== null && (
              <Alert variant={answers[currentQuestion] ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {answers[currentQuestion] ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription>
                    {answers[currentQuestion] 
                      ? "Correct!" 
                      : `Incorrect. The correct answer is: ${questions[currentQuestion]?.options[questions[currentQuestion]?.correctIndex]}`
                    }
                    {questions[currentQuestion]?.explanation && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {questions[currentQuestion].explanation}
                      </p>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">Your Score</p>
              <p className="text-4xl font-bold text-primary">
                {score} / {questions.length}
              </p>
              <p className="text-muted-foreground mt-2">
                ({Math.round((score / questions.length) * 100)}%)
              </p>
            </div>
            <div className="space-y-4">
              <Button onClick={handleReset} className="w-full">
                Try Again
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;