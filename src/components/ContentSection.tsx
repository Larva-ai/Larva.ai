"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { BookOpen } from "lucide-react"
import MarkdownRenderer from "./MarkdownRenderer"

export default function ContentSection() {
  const [topic, setTopic] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateNotes = async () => {
    setLoading(true)
    setError(null)
    setNotes("")

    try {
      const response = await axios.get(`/api/gemini`, {
        params: {
          topic: topic,
        },
      })
      console.log(response.data)
      const { notes: generatedNotes } = response.data

      setNotes(generatedNotes)
    } catch (err: any) {
      console.error("Error generating notes:", err)
      setError(err.response?.data?.error || err.message || "Failed to generate notes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && topic) {
      generateNotes()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Input Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-0 z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-blue-600" />
            AI Study Notes Generator
          </h1>
          <p className="text-gray-600 mt-2">Generate comprehensive study notes on any topic using AI</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., JavaScript Promises, React Hooks, Python Data Structures"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={generateNotes}
              disabled={loading || !topic}
              className="min-w-[140px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate Notes"
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes Output Card */}
      {notes && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Generated Study Notes
            </h2>
          </div>
          <div className="p-6 z-10">
           <MarkdownRenderer content={notes}/>
          </div>
        </div>
      )}
    </div>
  )
}
