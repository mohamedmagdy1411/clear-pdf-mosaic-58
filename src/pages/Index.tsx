import PDFViewer from "@/components/PDFViewer/PDFViewer";

const Index = () => {
  // For testing, we'll use a sample PDF from Mozilla
  const samplePDFUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

  return <PDFViewer url={samplePDFUrl} />;
};

export default Index;