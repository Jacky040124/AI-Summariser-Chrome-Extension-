import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: "CeQvCT9p8e7Uz0kIatDiIUxER5uLDJkqX0qPrkKl",
});

async function fetchPageContent(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove script and style elements
  const scripts = doc.getElementsByTagName('script');
  const styles = doc.getElementsByTagName('style');
  Array.from(scripts).forEach(script => script.remove());
  Array.from(styles).forEach(style => style.remove());

  // Extract text from body
  const body = doc.body;
  return body ? body.textContent || "" : "";
}

export async function summarizeUrl(url: string): Promise<string> {
  try {
    console.log("Fetching content from URL:", url);
    const content = await fetchPageContent(url);
    
    if (content.length < 250) {
      throw new Error("Extracted content is too short to summarize (less than 250 characters)");
    }

    console.log("Content fetched, length:", content.length);

    const response = await cohere.summarize({
      text: content,
      length: 'medium',
      format: 'paragraph',
      model: 'command',
      extractiveness: 'medium',
      temperature: 0.3,
    });

    console.log("Summarization successful");
    const summary = response.summary ?? ""; // Add nullish coalescing operator to handle undefined value
    return summary;
  } catch (error) {
    console.error("Detailed error in summarizeUrl:", error);
    if (error instanceof Error) {
      return `An error occurred: ${error.message}`;
    } else {
      return "An unknown error occurred while summarizing the content.";
    }
  }
}