import { useState } from "react";
import PDFViewer from "@/components/PDFViewer/PDFViewer";
import PDFUploader from "@/components/PDFUploader/PDFUploader";

const Index = () => {
  const [pdfUrl, setPdfUrl] = useState<string>("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf");

  const handleFileSelect = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
  };

  return (
    <div className="space-y-8">
      <PDFUploader onFileSelect={handleFileSelect} />
      <PDFViewer url={pdfUrl} />
    </div>
  );
};

export default Index;