import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * OpenAI Chat API Route
 * 
 * This file implements a Next.js API route that communicates with OpenAI's API.
 * It receives messages from the client and returns AI-generated responses.
 * 
 * The route is part of Next.js App Router API convention, where:
 * - Files named 'route.js' or 'route.ts' in the app directory define API endpoints
 * - The HTTP method name (POST, GET, etc.) defines which requests the endpoint handles
 * 
 * Environment Variables:
 * - OPENAI_API_KEY: Your OpenAI API key (required)
 * 
 * Request Format:
 * - Method: POST
 * - Body: JSON object with a 'message' field
 * 
 * Response Format:
 * - Success: JSON object with a 'response' field containing the AI's response
 * - Error: JSON object with 'error' and 'details' fields
 */

// Debug log for API key (remove in production)
console.log('OPENAI_API_KEY', process.env.OPENAI_API_KEY);

/**
 * Initialize the OpenAI client with the API key from environment variables
 * The API key should be set in your .env file:
 * OPENAI_API_KEY=your_actual_openai_api_key_here
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * OPTIONS request handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * POST request handler for the /api/generic/chat endpoint
 * 
 * This function:
 * 1. Extracts the message from the request body
 * 2. Validates that a message was provided
 * 3. Calls the OpenAI API with the message
 * 4. Returns the AI's response
 * 
 * @param request - The incoming HTTP request object
 * @returns A NextResponse object with the API response
 */
export async function POST(request: Request) {
  console.log('API route called');
  try {
    // Extract and log the request body for debugging
    const requestText = await request.text();
    console.log('Request body:', requestText);
    
    // Parse the JSON body
    const body = JSON.parse(requestText);
    const { message } = body;
    
    console.log('Message:', message);

    // Validate that a message was provided
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    /**
     * Call the OpenAI API to generate a response
     * 
     * Parameters:
     * - model: The AI model to use (gpt-3.5-turbo is a good balance of capability and cost)
     * - messages: Array of message objects that define the conversation context
     * - temperature: Controls randomness (0 = deterministic, 1 = creative)
     */
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        // System message defines the AI's behavior/persona
        { role: "system", content: "You are a helpful assistant." },
        // User message contains the message from the client
        { role: "user", content: message }
      ],
      temperature: 0.7, // Balanced between deterministic and creative
    });

    // Extract the AI's response text from the API response
    const response = completion.choices[0].message.content;

    // Return the response as JSON with CORS headers
    return NextResponse.json(
      { response },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    // Log and return any errors that occur
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
} 