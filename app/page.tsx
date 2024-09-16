import PDFCombiner from "./page.client";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Combiner</h1>
      <PDFCombiner />
    </main>
  );
}
