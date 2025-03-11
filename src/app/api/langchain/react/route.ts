import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';

// Initialize chat model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
});

// Store conversation history (in memory for now)
// In a real app, this should be in a database
const conversationHistory = new Map<string, Array<HumanMessage | AIMessage>>();

// Format messages with system prompt
async function formatMessages(message: string, sessionId: string): Promise<BaseMessage[]> {
  const history = conversationHistory.get(sessionId) || [];
  return [
    new SystemMessage(
      'You are a helpful AI assistant that uses the ReAct (Reasoning and Acting) pattern. ' +
      'For each response, first explain your thought process, then describe your action, and finally provide your response. ' +
      'Format your response as:\nThought: [your reasoning]\nAction: [your action]\nResponse: [your response to the user]\n\n' +
      'Always maintain context of the conversation.'
    ),
    ...history,
    new HumanMessage(message),
  ];
}

// Parse the response into structured format
function parseResponse(content: string) {
  const thought = content.match(/Thought: (.*?)(?=\nAction:|$)/)?.[1]?.trim() || 'No explicit thought process';
  const action = content.match(/Action: (.*?)(?=\nResponse:|$)/)?.[1]?.trim() || 'Direct response';
  const finalResponse = content.match(/Response: (.*?)$/)?.[1]?.trim() || content;

  return {
    thought,
    action,
    response: finalResponse,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate a session ID from the request cookies or create a new one
    const sessionId = request.cookies.get('sessionId')?.value || 
      Math.random().toString(36).substring(7);

    // Format messages with history and system prompt
    const messages = await formatMessages(message, sessionId);

    // Get response from the model
    const modelResponse = await model.invoke(messages);
    
    // Parse the response
    const result = parseResponse(modelResponse.content as string);

    // Update conversation history
    const history = conversationHistory.get(sessionId) || [];
    history.push(
      new HumanMessage(message),
      new AIMessage(result.response)
    );
    conversationHistory.set(sessionId, history);

    // Create the response
    const response = NextResponse.json(result);

    // Set the session cookie if it doesn't exist
    if (!request.cookies.get('sessionId')) {
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return response;
  } catch (error) {
    console.error('Error in ReAct API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 