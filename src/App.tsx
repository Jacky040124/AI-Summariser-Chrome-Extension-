import { useState } from 'react';
import './App.css';
import { summarizeUrl } from '../Components/cohere-summariser';

function App() {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    const getCurrentTabUrl = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab.url;
    };

    setIsLoading(true);
    setError(null);
    setSummary('');
    try {
      const url = await getCurrentTabUrl();
      if (!url) {
        throw new Error("Unable to get current tab URL");
      }
      console.log("Current URL:", url);
      const summarizedContent = await summarizeUrl(url);
      setSummary(summarizedContent);
    } catch (error) {
      console.error("Error in handleSummarize:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Webpage Summarizer</h1>
      <button onClick={handleSummarize} disabled={isLoading}>
        {isLoading ? 'Summarizing...' : 'Summarize This Page'}
      </button>
      {isLoading && <p>Please wait, fetching and summarizing the webpage...</p>}
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
      {summary && (
        <div>
          <h2>Summary:</h2>
          <div>{summary}</div>
        </div>
      )}
    </div>
  );
}

export default App;