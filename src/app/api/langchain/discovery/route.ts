import { NextResponse } from 'next/server';
import metadata from './metadata';

export async function GET() {
  return NextResponse.json(metadata);
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