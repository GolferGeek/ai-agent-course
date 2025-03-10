'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { APIMetadata } from '@/utils/discovery';

export default function APIDirectory() {
  const [apis, setApis] = useState<APIMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAPIs() {
      try {
        const response = await fetch('/api/discovery');
        if (!response.ok) {
          throw new Error('Failed to fetch APIs');
        }
        const data = await response.json();
        setApis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load APIs');
      } finally {
        setLoading(false);
      }
    }

    fetchAPIs();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading APIs...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const renderAPICard = (api: APIMetadata) => (
    <div key={api.endpoint} className={styles.card}>
      <h3>{api.name}</h3>
      <p className={styles.description}>{api.description}</p>
      <div className={styles.endpoint}>
        <span className={styles.method}>{api.method}</span>
        <code className={styles.url}>{api.endpoint}</code>
      </div>
      <div className={styles.actions}>
        <Link 
          href={`/playground${api.endpoint.replace('/api', '')}`} 
          className={styles.tryButton}
        >
          Try it &rarr;
        </Link>
        {api.subApis && api.subApis.length > 0 && (
          <div className={styles.subApisInfo}>
            {api.subApis.length} Sub-APIs available
          </div>
        )}
      </div>
    </div>
  );

  const renderCategory = (title: string, prefix: string) => {
    const categoryApis = apis.filter(api => api.endpoint.startsWith(prefix));
    if (categoryApis.length === 0) return null;

    return (
      <section key={prefix} className={styles.category}>
        <h2>{title}</h2>
        <div className={styles.grid}>
          {categoryApis.map(renderAPICard)}
        </div>
      </section>
    );
  };

  return (
    <div className={styles.container}>
      <h1>API Directory</h1>
      <p className={styles.intro}>
        Browse and test available APIs. Each API includes interactive documentation
        and a testing playground.
      </p>

      <div className={styles.categories}>
        {renderCategory('Generic APIs', '/api/generic')}
        {renderCategory('LangChain APIs', '/api/langchain')}
        {renderCategory('CrewAI APIs', '/api/crewai')}
        {renderCategory('LangGraph APIs', '/api/langgraph')}
      </div>
    </div>
  );
} 