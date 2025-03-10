'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import APIPlayground from '@/components/APIPlayground';
import styles from './page.module.css';

export default function PlaygroundPage() {
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
            <Link href={`/playground/${array.slice(0, index + 1).join('/')}`}>
              {segment}
            </Link>
          </span>
        ))}
      </nav>

      <APIPlayground metadata={metadata} />
    </div>
  );
} 