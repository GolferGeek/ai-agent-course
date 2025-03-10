'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../page.module.css';

interface ApiInfo {
  name: string;
  endpoint: string;
  description: string;
  method: string;
  parameters: Record<string, any>;
  responses: Record<string, any>;
}

/**
 * Generic APIs Directory Page
 * 
 * This page serves as a directory of all generic API implementations.
 * For each API, it provides:
 * - A link to try the API interactively
 * - API documentation and details
 * - Description of functionality
 */
export default function GenericApiDirectory() {
  const [apis, setApis] = useState<ApiInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchApis() {
      try {
        const response = await fetch('/api/generic');
        if (!response.ok) {
          throw new Error('Failed to fetch APIs');
        }
        const data = await response.json();
        setApis(data.apis);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load APIs');
      } finally {
        setLoading(false);
      }
    }

    fetchApis();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.backLink}>
        <Link href="/">&larr; Back to Home</Link>
      </div>
      
      <h1 className={styles.title}>Generic APIs Directory</h1>
      <p className={styles.description}>
        A collection of generic API implementations
      </p>

      {loading && <p>Loading available APIs...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      <div className={styles.grid}>
        {apis.map((api) => (
          <div key={api.endpoint} className={styles.apiCard}>
            <h2>{api.name}</h2>
            <p>{api.description}</p>
            <div className={styles.cardLinks}>
              {/* Interactive Link */}
              <Link 
                href={`/pages${api.endpoint.replace('/api', '')}`} 
                className={styles.tryButton}
              >
                Try it &rarr;
              </Link>
              
              {/* API Details Expander */}
              <details className={styles.apiDetails}>
                <summary>API Details</summary>
                <div className={styles.apiInfo}>
                  <p><strong>Endpoint:</strong> {api.endpoint}</p>
                  <p><strong>Method:</strong> {api.method}</p>
                  
                  <h3>Parameters:</h3>
                  <ul>
                    {Object.entries(api.parameters).map(([name, details]: [string, any]) => (
                      <li key={name}>
                        <strong>{name}</strong> ({details.type})
                        {details.required && <span className={styles.required}>*</span>}
                        <br />
                        <small>{details.description}</small>
                      </li>
                    ))}
                  </ul>

                  <h3>Responses:</h3>
                  <ul>
                    {Object.entries(api.responses).map(([code, details]: [string, any]) => (
                      <li key={code}>
                        <strong>{code}</strong>: {details.description}
                        {details.content && (
                          <ul>
                            {Object.entries(details.content).map(([field, info]: [string, any]) => (
                              <li key={field}>
                                <code>{field}</code> ({info.type}): {info.description}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 