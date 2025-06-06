"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"

interface MarkdownRendererProps {
  content: string
}

function stripMarkdownCodeBlock(content: string): string {
  const cleaned = content.replace(/^[\u200B-\u200F\uFEFF]/g, "").trim()
  const tripleBacktickRegex = /^```(?:\w+)?\n([\s\S]*?)\n```$/
  const match = cleaned.match(tripleBacktickRegex)
  return match ? match[1].trim() : cleaned
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const processedRef = useRef<boolean>(false)

  const cleanContent = stripMarkdownCodeBlock(content)

  marked.setOptions({
    breaks: true,
    gfm: true,
  })

  const rawHtml = marked.parse(cleanContent)
  const sanitizedHtml = DOMPurify.sanitize(rawHtml)

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("Failed to copy code", err)
    }
  }

  useEffect(() => {
    // Reset processed flag when content changes
    processedRef.current = false
  }, [sanitizedHtml])

  useEffect(() => {
    if (containerRef.current && !processedRef.current) {
      // Clear any existing enhanced code blocks first
      const existingWrappers = containerRef.current.querySelectorAll(".code-block-wrapper")
      existingWrappers.forEach((wrapper) => {
        const pre = wrapper.querySelector("pre")
        if (pre && wrapper.parentNode) {
          // Move pre back to its original position
          wrapper.parentNode.insertBefore(pre, wrapper)
          wrapper.remove()
        }
      })

      const codeBlocks = containerRef.current.querySelectorAll("pre code")

      codeBlocks.forEach((block, index) => {
        const pre = block.parentElement as HTMLPreElement
        if (pre) {
          // Create wrapper for the entire code block
          const wrapper = document.createElement("div")
          wrapper.className =
            "code-block-wrapper relative my-4 border border-gray-200 bg-[#f7f7f8] dark:bg-[#1e1e20] dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"

          // Create header with language and copy button
          const header = document.createElement("div")
          header.className =
            "flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"

          // Language label
          const languageSpan = document.createElement("span")
          const className = block.className || ""
          const language = className.replace("language-", "") || "text"
          languageSpan.className = "text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
          languageSpan.textContent = language

          // Copy button
          const copyButton = document.createElement("button")
          copyButton.className =
            "copy-button flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-300 dark:border-gray-600"
          copyButton.setAttribute("data-index", index.toString())

          // Create copy icon and text
          const updateButton = (copied: boolean) => {
            if (copied) {
              copyButton.innerHTML = `
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-green-600">Copied!</span>
              `
            } else {
              copyButton.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Copy code
              `
            }
          }

          updateButton(false)

          copyButton.onclick = () => {
            copyToClipboard(block.textContent || "", index)
          }

          header.appendChild(languageSpan)
          header.appendChild(copyButton)

          // Style the pre element
          pre.className = "p-4 overflow-x-auto text-sm bg-[#171717] text-gray-100 font-mono rounded-none m-0"

          // Insert wrapper before pre
          const parent = pre.parentNode
          if (parent) {
            parent.insertBefore(wrapper, pre)
            wrapper.appendChild(header)
            wrapper.appendChild(pre)
          }
          // Store update function for later use
          ;(copyButton as any).updateButton = updateButton
        }
      })

      // Mark as processed
      processedRef.current = true
    }
  }, [sanitizedHtml])

  // Update copy button states when copiedIndex changes
  useEffect(() => {
    if (containerRef.current) {
      const copyButtons = containerRef.current.querySelectorAll(".copy-button")
      copyButtons.forEach((button) => {
        const index = Number.parseInt(button.getAttribute("data-index") || "0")
        const updateButton = (button as any).updateButton
        if (updateButton) {
          updateButton(copiedIndex === index)
        }
      })
    }
  }, [copiedIndex])

  return (
    <div
      ref={containerRef}
      className="markdown-content prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      style={
        {
          font: "Arial, sans-serif",
          background: "#212121",
          padding: "20px",
          borderRadius: "10px",
          "--tw-prose-pre-bg": "#1e1e20",
          "--tw-prose-pre-code": "#e5e7eb",
          "--tw-prose-code": "#eab308",
          "--tw-prose-headings": "#ffffff",
          "--tw-prose-body": "#e5e7eb",
          "--tw-prose-bold": "#ffffff",
          "--tw-prose-bullets": "#9ca3af",
          "--tw-prose-counters": "#9ca3af",
        } as React.CSSProperties
      }
    />
  )
}
