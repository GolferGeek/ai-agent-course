'use client';

import { useEffect, useState } from 'react';
import APITree from '@/components/APITree';
import styles from './page.module.css';
import { APIMetadata } from '@/utils/discovery';

interface APICategory {
  name: string;
  description: string;
  apis: APIMetadata[];
}

export default function APIDirectory() {
  const [categories, setCategories] = useState<APICategory[]>([]);
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
        
        // Transform root-level APIs into categories
        const apiCategories: APICategory[] = [];
        
        // Find all root-level category APIs
        const rootApis = data.filter((api: APIMetadata) => {
          const pathParts = api.endpoint.split('/').filter(Boolean);
          return pathParts.length === 2; // /api/<category>
        });
        
        // Convert each root API into a category
        rootApis.forEach((rootApi: APIMetadata) => {
          const categoryApis = rootApi.subApis || [];
          if (categoryApis.length > 0 || rootApi.name.includes('APIs')) {
            apiCategories.push({
              name: rootApi.name,
              description: rootApi.description,
              apis: categoryApis
            });
          }
        });

        setCategories(apiCategories);
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

  return (
    <div className={styles.container}>
      <APITree categories={categories} />
    </div>
  );
} 