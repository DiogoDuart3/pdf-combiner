// components/PDFCombiner.tsx
'use client'

import { useState, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, FileText, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PDFCombiner(): JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setSelectedFiles(files)
    }
  }

  const handleCombine = async () => {
    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    selectedFiles.forEach((file) => {
      formData.append(`file`, file)
    })

    try {
      const response = await fetch('/api/combine-pdfs', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('PDF combination failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'combined.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Combine PDFs</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
          className="mb-4"
        />
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Selected Files:</h3>
            <ul className="list-disc pl-5">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm">
                  <FileText className="inline mr-2" size={16} />
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button 
          onClick={handleCombine} 
          disabled={selectedFiles.length === 0 || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Combine and Download PDF'
          )}
        </Button>
      </CardContent>
      <CardFooter>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}