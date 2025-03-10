'use client';

import { useState } from 'react';
import styles from '../../../page.module.css';
import Link from 'next/link';

/**
 * Generic OpenAI Chat Agent Component
 * 
 * This client-side component provides a user interface for interacting with the OpenAI API.
 * It allows users to enter prompts and displays the AI's responses.
 * 
 * Key features:
 * - Text area for entering prompts
 * - Submit button with loading state
 * - Display area for AI responses
 * - Error handling for API failures
 */
export default function GenericChatAgent() {
  // State for the user's input prompt
  const [prompt, setPrompt] = useState('');
  // State for the AI's response
  const [response, setResponse] = useState('');
  // State for tracking loading/processing status
  const [loading, setLoading] = useState(false);
  // State for tracking errors
  const [error, setError] = useState('');

  /**
   * Handles form submission to send the prompt to the OpenAI API
   * 
   * @param e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(''); // Clear previous response
    setError(''); // Clear previous errors
    
    try {
      console.log('Sending request to API with prompt:', prompt);
      
      // Send the prompt to our API endpoint
      const res = await fetch('/api/generic/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        cache: 'no-store',
      });
      
      console.log('API response status:', res.status);
      
      // Handle non-successful responses
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error:', res.status, errorText);
        throw new Error(`API returned ${res.status}: ${errorText}`);
      }
      
      // Parse and display the response
      const data = await res.json();
      console.log('API response data:', data);
      
      if (data.response) {
        setResponse(data.response);
      } else if (data.error) {
        throw new Error(`API error: ${data.error} ${data.details || ''}`);
      } else {
        throw new Error('Received an empty response from the API');
      }
    } catch (error) {
      // Handle and display any errors
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      // Always reset loading state when done
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.backLink}>
        <Link href="/pages/generic">&larr; Back to Generic APIs</Link>
      </div>
      
      <h1 className={styles.title}>Generic OpenAI Chat</h1>
      
      {/* Form for submitting prompts */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={5}
          className={styles.textarea}
        />
        <button 
          type="submit" 
          disabled={loading || !prompt.trim()} 
          className={styles.button}
        >
          {loading ? 'Thinking...' : 'Submit'}
        </button>
      </form>

      {/* Display area for the AI response */}
      {response && (
        <div className={styles.response}>
          <h2>Response:</h2>
          <div className={styles.responseContent}>
            {response}
          </div>
        </div>
      )}
      
      {/* Display area for errors */}
      {error && (
        <div className={styles.response}>
          <h2>Error:</h2>
          <div className={styles.responseContent} style={{ color: 'red' }}>
            {error}
          </div>
        </div>
      )}
    </main>
  );
} 