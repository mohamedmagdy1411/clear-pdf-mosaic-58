import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import PDFControls from './PDFControls';
import { supabase } from "@/integrations/supabase/client";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

const PDFViewer = ({ url }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setIsLoading(false);
    toast({
      variant: "destructive",
      title: "Error loading PDF",
      description: "Please try again later or check if the file is valid.",
    });
    console.error('Error loading PDF:', error);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(2, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.1));
  };

  const getPageText = async (pageNum: number): Promise<string | null> => {
    try {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      return null;
    }
  };

  const handleGeminiAction = async (action: 'translate' | 'explain' | 'quiz') => {
    try {
      const pageText = await getPageText(currentPage);
      
      if (!pageText) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not extract text from this page.",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: { 
          text: pageText,
          action: action
        }
      });

      if (error) {
        throw error;
      }

      if (action === 'quiz' && data?.result) {
        try {
          const questions = JSON.parse(data.result);
          questions.forEach((q: any, index: number) => {
            toast({
              title: `Question ${index + 1}`,
              description: `${q.question}\n\nOptions:\n${q.options.join('\n')}\n\nCorrect Answer: ${q.options[q.correctIndex]}`,
              duration: 10000,
            });
          });
        } catch (e) {
          toast({
            title: "Quiz Generated",
            description: data.result,
            duration: 10000,
          });
        }
      } else {
        toast({
          title: action === 'translate' ? "Translation" : "Explanation",
          description: data.result,
          duration: 10000,
        });
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      toast({
        variant: "destructive",
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Error`,
        description: `Could not ${action} the text. Please try again later.`,
      });
    }
  };

  const handleTranslate = () => handleGeminiAction('translate');
  const handleExplain = () => handleGeminiAction('explain');
  const handleGenerateQuiz = () => handleGeminiAction('quiz');

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-8 pb-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 min-h-[calc(100vh-16rem)] flex flex-col items-center">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              loading={null}
              className="shadow-md"
            />
          </Document>
        </div>
      </div>

      {numPages > 0 && (
        <PDFControls
          numPages={numPages}
          currentPage={currentPage}
          scale={scale}
          onPageChange={handlePageChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onTranslate={handleTranslate}
          onExplain={handleExplain}
          onGenerateQuiz={handleGenerateQuiz}
        />
      )}
    </div>
  );
};

export default PDFViewer;