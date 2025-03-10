import { NextResponse } from 'next/server';

/**
 * Generic APIs Directory Route
 * 
 * This route provides a directory of all available generic API endpoints.
 * It serves as both documentation and discovery for available APIs.
 * 
 * Response Format:
 * - apis: Array of API objects containing:
 *   - name: Name of the API
 *   - endpoint: API endpoint path
 *   - description: Brief description of what the API does
 *   - method: HTTP method(s) supported
 */

export async function GET() {
  // List of all available generic APIs
  const apis = [
    {
      name: 'OpenAI Chat',
      endpoint: '/api/generic/chat',
      description: 'Simple chat implementation using OpenAI\'s GPT models',
      method: 'POST',
      parameters: {
        prompt: {
          type: 'string',
          description: 'The text prompt to send to the AI',
          required: true
        }
      },
      responses: {
        200: {
          description: 'Successful response',
          content: {
            response: {
              type: 'string',
              description: 'The AI-generated response'
            }
          }
        },
        400: {
          description: 'Bad request - prompt is missing'
        },
        500: {
          description: 'Server error or OpenAI API error'
        }
      }
    }
    // Add more APIs here as they are implemented
  ];

  return NextResponse.json(
    { apis },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
}

/**
 * OPTIONS request handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 