'use client'

import { useState, useCallback } from 'react'
import { Upload, Camera, X } from 'lucide-react'
import Image from 'next/image'

interface UploadFormProps {
  onAnalysisComplete?: (data: any) => void
}

export default function UploadForm({ onAnalysisComplete }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFile(files[0])
    }
  }, [])
  const handleFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setPreview(base64)
      await analyzeImage(base64)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      })
      
      const result = await response.json()
      if (result.success) {
        setAnalysisResult(result.data)
        onAnalysisComplete?.(result.data)
      }
    } catch (error) {
      console.error('Fehler bei der Analyse:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      handleFile(files[0])
    }
  }
  const reset = () => {
    setPreview(null)
    setAnalysisResult(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-green-400'
            }
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Foto hier ablegen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG oder WebP • Max. 10MB
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Image
              src={preview}
              alt="Vorschau"
              width={600}
              height={400}
              className="rounded-lg w-full h-auto"
            />
            <button
              onClick={reset}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {isAnalyzing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700 font-medium">
                KI analysiert dein Bild...
              </p>
            </div>
          )}
          
          {analysisResult && (
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-green-800">
                Erkannt: {analysisResult.title}
              </h3>
              <p className="text-sm text-green-700">
                Kategorie: {analysisResult.category}
              </p>
              <p className="text-sm text-green-700">
                Zustand: {analysisResult.condition}
              </p>
              <p className="text-sm text-green-700">
                Empfohlener Preis: {analysisResult.suggestedPricePerDay}€/Tag
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}