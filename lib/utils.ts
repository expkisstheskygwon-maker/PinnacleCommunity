import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { marked } from "marked"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to convert plain text or basic markdown to HTML, preserving newlines
export function formatContent(text: string): string {
  if (!text) return "";
  
  // Parse markdown with break option enabled (newlines -> <br />)
  return marked.parse(text, {
    breaks: true,
    gfm: true,
    async: false
  }) as string;
}
