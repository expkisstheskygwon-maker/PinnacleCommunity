import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to convert plain text or basic markdown to HTML, preserving newlines
export function formatContent(text: string): string {
  if (!text) return "";
  
  // If it already contains HTML tags, render it as-is
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  
  // Otherwise, escape and convert markdown and newlines
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Convert basic markdown tags
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  html = html.replace(/^&gt; (.*?)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/^\s*[-*+]\s+(.*?)$/gm, "<li>$1</li>");
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, "<li>$1</li>");
  
  // Convert newlines to <br />
  html = html.replace(/\n/g, "<br />");
  
  return html;
}
