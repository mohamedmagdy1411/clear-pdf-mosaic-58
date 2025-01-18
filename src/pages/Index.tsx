import PDFViewer from "@/components/PDFViewer/PDFViewer";
import PDFUploader from "@/components/PDFUploader/PDFUploader";

const Index = () => {
  // For testing, we'll use a sample PDF from Mozilla
  const samplePDFUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

  return (
    <div className="space-y-8">
      <PDFUploader />
      <PDFViewer url={samplePDFUrl} />
    </div>
  );
};

export default Index;