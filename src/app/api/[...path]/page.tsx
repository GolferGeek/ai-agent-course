'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import APIPlayground from '@/components/APIPlayground';
import styles from './page.module.css';

export default function DynamicAPIPage() {
  const params = useParams();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
  const discoveryPath = `/api/${path}/discovery`;

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch(discoveryPath);
        if (!response.ok) {
          throw new Error('API metadata not found');
        }
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API metadata');
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, [discoveryPath]);

  if (loading) {
    return <div className={styles.loading}>Loading API details...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <Link href="/api" className={styles.backLink}>
          &larr; Back to API Directory
        </Link>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className={styles.notFound}>
        <p>API not found</p>
        <Link href="/api" className={styles.backLink}>
          &larr; Back to API Directory
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs}>
        <Link href="/api">&larr; API Directory</Link>
        {path.split('/').map((segment, index, array) => (
          <span key={index}>
            {' / '}
            <Link href={`/api/${array.slice(0, index + 1).join('/')}`}>
              {segment}
            </Link>
          </span>
        ))}
      </nav>

      <APIPlayground metadata={metadata} />

      {metadata.subApis && metadata.subApis.length > 0 && (
        <div className={styles.subApis}>
          <h3>Related APIs</h3>
          <div className={styles.grid}>
            {metadata.subApis.map((api: any) => (
              <div key={api.endpoint} className={styles.card}>
                <h4>{api.name}</h4>
                <p>{api.description}</p>
                <Link 
                  href={`/api${api.endpoint.replace('/api', '')}`}
                  className={styles.tryButton}
                >
                  Try it &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 