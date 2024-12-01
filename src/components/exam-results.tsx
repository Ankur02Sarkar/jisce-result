"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { Download, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const semesters = [
  { id: "sem1", label: "Semester 1", examId: "E20A39" },
  { id: "sem2", label: "Semester 2", examId: "F21A41" },
  { id: "sem3", label: "Semester 3", examId: "H21A02" },
  { id: "sem4", label: "Semester 4", examId: "I22A02" },
  { id: "sem5", label: "Semester 5", examId: "K22A02" },
  { id: "sem6", label: "Semester 6", examId: "M23A03" },
];

export default function ExamResults() {
  const [rollNumber, setRollNumber] = useState("");
  const [activeTab, setActiveTab] = useState("sem1");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPdf = async (examId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/fetch-pdf?rollNumber=${rollNumber}&examId=${examId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
    setLoading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const semester = semesters.find((sem) => sem.id === value);
    if (semester && rollNumber) {
      fetchPdf(semester.examId);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const semester = semesters.find((sem) => sem.id === activeTab);
    if (semester) {
      fetchPdf(semester.examId);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-blue-100 dark:from-gray-900 dark:to-purple-900 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Exam Results Viewer
          </h1>
          <ThemeToggle />
        </div>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="flex-grow p-4 text-lg rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <Button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
              Fetch Results
            </Button>
          </div>
        </form>
        <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
          <Tabs.List className="flex flex-wrap mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {semesters.map((semester) => (
              <Tabs.Trigger
                key={semester.id}
                value={semester.id}
                className={`flex-1 min-w-[50%] sm:min-w-[33.33%] md:min-w-[16.66%] p-4 text-center transition-all duration-300 ${
                  activeTab === semester.id
                    ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {semester.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8"
        >
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
          ) : pdfUrl ? (
            <div className="border-4 border-gradient-to-r from-blue-500 to-violet-500 rounded-lg overflow-hidden">
              <Document file={pdfUrl}>
                <Page pageNumber={1} width={800} />
              </Document>
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300">
              Enter a roll number and select a semester to view results.
            </p>
          )}
        </motion.div>
        {pdfUrl && (
          <div className="text-center">
            <Button
              onClick={() => window.open(pdfUrl, "_blank")}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
