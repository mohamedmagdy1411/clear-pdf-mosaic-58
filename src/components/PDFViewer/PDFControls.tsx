import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Languages,
  MessageSquareText,
  BrainCircuit,
  Settings2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PDFControlsProps {
  numPages: number;
  currentPage: number;
  scale: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTranslate: (language: string, instructions?: string) => void;
  onExplain: (style: string, instructions?: string) => void;
  onGenerateQuiz: () => void;
}

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi'
];

const EXPLANATION_STYLES = [
  { label: 'Simple', value: 'simple' },
  { label: 'Technical', value: 'technical' },
  { label: 'Academic', value: 'academic' },
];

const PDFControls = ({
  numPages,
  currentPage,
  scale,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onTranslate,
  onExplain,
  onGenerateQuiz
}: PDFControlsProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [translationInstructions, setTranslationInstructions] = useState('');
  const [explanationInstructions, setExplanationInstructions] = useState('');

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= numPages) {
      onPageChange(value);
    }
  };

  const handleTranslateClick = () => {
    if (selectedLanguage) {
      onTranslate(selectedLanguage, translationInstructions);
    }
  };

  const handleExplainClick = () => {
    if (selectedStyle) {
      onExplain(selectedStyle, explanationInstructions);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={handlePageInput}
              className="w-16 text-center"
            />
            <span className="text-sm text-gray-500">of {numPages}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleTranslateClick}
                disabled={!selectedLanguage}
              >
                <Languages className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Translate this page</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleExplainClick}
                disabled={!selectedStyle}
              >
                <MessageSquareText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get an explanation</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onGenerateQuiz}>
                <BrainCircuit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate interactive quiz</p>
            </TooltipContent>
          </Tooltip>

          <div className="border-l border-gray-200 mx-2 h-6" />

          <Button
            variant="outline"
            size="icon"
            onClick={onZoomOut}
            disabled={scale <= 0.5}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500 w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomIn}
            disabled={scale >= 2}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <div className="border-l border-gray-200 mx-2 h-6" />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Translation Language</label>
                  <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Enter translation instructions..."
                    value={translationInstructions}
                    onChange={(e) => setTranslationInstructions(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation Style</label>
                  <Select onValueChange={setSelectedStyle} value={selectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPLANATION_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Enter explanation instructions..."
                    value={explanationInstructions}
                    onChange={(e) => setExplanationInstructions(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default PDFControls;