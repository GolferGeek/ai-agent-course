import { promises as fs } from 'fs';
import path from 'path';

export interface Parameter {
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  items?: {
    type: string;
  };
  properties?: Record<string, Parameter>;
  mimeTypes?: string[];
}

export interface APIMetadata {
  name: string;
  endpoint: string;
  description: string;
  method: string;
  parameters: Record<string, Parameter>;
  responses: {
    [key: string]: {
      description: string;
      content?: Record<string, {
        type: string;
        description: string;
      }>;
    };
  };
  subApis?: APIMetadata[];
}

export async function discoverAPIs(basePath: string): Promise<APIMetadata[]> {
  const apis: APIMetadata[] = [];
  
  try {
    const entries = await fs.readdir(basePath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip discovery and special directories
        if (entry.name === 'discovery' || entry.name.startsWith('_') || entry.name.startsWith('.')) {
          continue;
        }
        
        const fullPath = path.join(basePath, entry.name);
        
        // Check if this directory has a route.ts file (indicating it's an API endpoint)
        const hasRoute = await fs.stat(path.join(fullPath, 'route.ts'))
          .then(() => true)
          .catch(() => false);

        if (hasRoute) {
          // This is an API endpoint, check for discovery
          const hasDiscovery = await fs.stat(path.join(fullPath, 'discovery', 'metadata.ts'))
            .then(() => true)
            .catch(() => false);

          if (hasDiscovery) {
            // Convert filesystem path to API endpoint path
            const relativePath = path.relative(path.join(process.cwd(), 'src', 'app'), fullPath);
            const apiPath = '/' + relativePath.split(path.sep).join('/');
            
            try {
              // Fetch metadata through the discovery endpoint
              const response = await fetch(`http://localhost:3000${apiPath}/discovery`);
              if (response.ok) {
                const metadata = await response.json();
                // Recursively discover sub-APIs
                const subApis = await discoverAPIs(fullPath);
                apis.push({
                  ...metadata,
                  subApis: subApis.length > 0 ? subApis : undefined
                });
              }
            } catch (err) {
              console.error(`Error fetching metadata for ${apiPath}:`, err);
            }
          }
        }

        // Continue searching subdirectories
        const subApis = await discoverAPIs(fullPath);
        if (subApis.length > 0) {
          apis.push(...subApis);
        }
      }
    }
  } catch (err) {
    console.error(`Error discovering APIs in ${basePath}:`, err);
  }
  
  return apis;
} 