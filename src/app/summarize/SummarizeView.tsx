"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import Link from "next/link"
import { summarizePdf } from "@/src/services/pdfServices"

export const SummarizeView = () => {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") setFile(droppedFile)
      else alert("Please upload a PDF file.")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleSummarize = async () => {
    if (!file) return
    setIsProcessing(true)

    summarizePdf(file)
      .catch((err) => {
        console.error("❌ Summarization error:", err)
        alert("An error occurred during summarization. Please try again.")
      })
      .finally(() => setIsProcessing(false))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">PDF Summarizer</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Card */}
          <Card
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-dashed border-2 p-8 cursor-pointer ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>
                Drag & drop your PDF here, or click to select a file
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                Choose File
              </Button>
              {file && <p className="text-sm text-slate-700">{file.name}</p>}
              {isProcessing && <Progress className="w-full" />}
            </CardContent>
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />
          </Card>

          {/* Summarize Button */}
          <div className="flex justify-center">
            <Button onClick={handleSummarize} disabled={!file || isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Download Summary PDF"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}