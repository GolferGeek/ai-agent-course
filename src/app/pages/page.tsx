'use client';

import Link from 'next/link';
import styles from '../page.module.css';

/**
 * Main Homepage Component
 * 
 * This is the main landing page for our AI Agent application.
 * It serves as a directory that lists all available AI agent types.
 * 
 * Features:
 * - Displays a title and description
 * - Shows cards for each type of AI agent implementation
 * - Each card links to its respective directory page
 */
export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>AI Agent Directory</h1>
      <p className={styles.description}>
        A collection of AI agents with their own implementations
      </p>

      <div className={styles.grid}>
        <Link href="/pages/generic" className={styles.card}>
          <h2>Generic APIs &rarr;</h2>
          <p>Simple, generic API implementations using various AI services.</p>
        </Link>
        <Link href="/pages/langchain" className={styles.card}>
          <h2>LangChain &rarr;</h2>
          <p>Implementations using the LangChain framework.</p>
        </Link>
        <Link href="/pages/langgraph" className={styles.card}>
          <h2>LangGraph &rarr;</h2>
          <p>Implementations using the LangGraph framework.</p>
        </Link>
        <Link href="/pages/crewai" className={styles.card}>
          <h2>CrewAI &rarr;</h2>
          <p>Implementations using the CrewAI framework.</p>
        </Link>
      </div>
    </main>
  );
} 