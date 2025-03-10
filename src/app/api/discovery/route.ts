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
    
    // First, check if the current directory has metadata
    const currentMetadataPath = path.join(basePath, 'discovery', 'metadata.ts');
    const hasCurrentMetadata = await fs.stat(currentMetadataPath)
      .then(() => true)
      .catch(() => false);

    if (hasCurrentMetadata) {
      const metadata = await getMetadataFromFile(currentMetadataPath);
      if (metadata) {
        // This directory represents an API category or endpoint
        const subApis: APIMetadata[] = [];
        
        // Process subdirectories
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name !== 'discovery' && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
            const fullPath = path.join(basePath, entry.name);
            const discoveredApis = await discoverAPIsServer(fullPath);
            subApis.push(...discoveredApis);
          }
        }
        
        if (subApis.length > 0) {
          apis.push({
            ...metadata,
            subApis
          });
        } else {
          apis.push(metadata);
        }
      }
    } else {
      // Process subdirectories if no metadata in current directory
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'discovery' && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
          const fullPath = path.join(basePath, entry.name);
          const discoveredApis = await discoverAPIsServer(fullPath);
          apis.push(...discoveredApis);
        }
      }
    }
  } catch (err) {
    console.error(`Error discovering APIs in ${basePath}:`, err);
  }
  
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