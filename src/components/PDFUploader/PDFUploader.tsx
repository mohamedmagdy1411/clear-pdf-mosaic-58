import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
}

const PDFUploader = ({ onFileSelect }: PDFUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile?.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file",
      });
      return;
    }
    setFile(uploadedFile);
    onFileSelect(uploadedFile);
  }, [toast, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-600">
          {isDragActive ? (
            "Drop the PDF here..."
          ) : (
            "Drag & drop a PDF file here, or click to select"
          )}
        </p>
      </div>

      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <div className="mt-4 space-y-2">
            <Button 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Translation and explanation features will be available soon!",
                });
              }}
            >
              Translate & Explain
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;