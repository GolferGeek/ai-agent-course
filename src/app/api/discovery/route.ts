import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { APIMetadata } from '@/utils/discovery';

async function getMetadataFromFile(metadataPath: string): Promise<APIMetadata | null> {
  try {
    console.log('Reading metadata from:', metadataPath);
    const content = await fs.readFile(metadataPath, 'utf-8');
    
    // Extract the metadata object from the TypeScript file
    const metadataMatch = content.match(/const metadata: APIMetadata = ({[\s\S]*?});/);
    if (!metadataMatch) {
      console.log('No metadata found in file');
      return null;
    }
    
    // Parse the metadata object
    const metadataString = metadataMatch[1];
    const metadata = JSON.parse(JSON.stringify(eval(`(${metadataString})`)));
    console.log('Successfully parsed metadata:', metadata);
    return metadata;
  } catch (err) {
    console.error(`Error reading metadata from ${metadataPath}:`, err);
    return null;
  }
}

async function discoverAPIsServer(basePath: string): Promise<APIMetadata[]> {
  console.log('Discovering APIs in:', basePath);
  const apis: APIMetadata[] = [];
  
  try {
    const entries = await fs.readdir(basePath, { withFileTypes: true });
    console.log('Found entries:', entries.map(e => e.name));
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip special directories
        if (entry.name === 'discovery' || entry.name.startsWith('_') || entry.name.startsWith('.')) {
          continue;
        }
        
        const fullPath = path.join(basePath, entry.name);
        console.log('Checking directory:', fullPath);
        
        // Check if this directory has a route.ts file
        const routePath = path.join(fullPath, 'route.ts');
        const hasRoute = await fs.stat(routePath)
          .then(() => true)
          .catch(() => false);

        if (hasRoute) {
          console.log('Found route.ts in:', fullPath);
          // Check for metadata
          const metadataPath = path.join(fullPath, 'discovery', 'metadata.ts');
          const hasMetadata = await fs.stat(metadataPath)
            .then(() => true)
            .catch(() => false);

          if (hasMetadata) {
            console.log('Found metadata.ts in:', fullPath);
            const metadata = await getMetadataFromFile(metadataPath);
            if (metadata) {
              // Recursively discover sub-APIs
              const subApis = await discoverAPIsServer(fullPath);
              apis.push({
                ...metadata,
                subApis: subApis.length > 0 ? subApis : undefined
              });
            }
          }
        }

        // Continue searching subdirectories
        const subApis = await discoverAPIsServer(fullPath);
        if (subApis.length > 0) {
          apis.push(...subApis);
        }
      }
    }
  } catch (err) {
    console.error(`Error discovering APIs in ${basePath}:`, err);
  }
  
  console.log('Discovered APIs in', basePath, ':', apis);
  return apis;
}

export async function GET() {
  console.log('Starting API discovery...');
  const apiBasePath = path.join(process.cwd(), 'src', 'app', 'api');
  console.log('API base path:', apiBasePath);
  
  const apis = await discoverAPIsServer(apiBasePath);
  console.log('Final discovered APIs:', apis);
  
  return NextResponse.json(apis);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 