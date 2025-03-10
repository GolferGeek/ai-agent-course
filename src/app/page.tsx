import Link from 'next/link';
import styles from './page.module.css';

/**
 * Home Page Component
 * 
 * This is the main landing page for our AI Agent application.
 * It serves as a directory that lists all available AI agents.
 * 
 * Features:
 * - Displays a title and description
 * - Shows cards for each available AI agent
 * - Each card links to the respective agent's page
 * 
 * As we develop more agents, we can add more cards to this grid.
 */
export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>AI Agent Directory</h1>
      <p className={styles.description}>
        A collection of AI agents with their own APIs
      </p>

      <div className={styles.grid}>
        <Link href="/api/generic" className={styles.card}>
          <h2>Generic APIs &rarr;</h2>
          <p>A collection of simple, generic API implementations.</p>
        </Link>
        {/* More agents will be added here as we develop them */}
      </div>
    </main>
  );
}
