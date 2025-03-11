import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Initialize chat model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
});

// Store conversation history (in memory for now)
// In a real app, this should be in a database
const conversationHistory = new Map<string, BaseMessage[]>();

// Initialize Tavily search tool
const searchTool = tool(
  async ({ query }: { query: string }) => {
    const tavily = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 3,
    });
    return JSON.stringify(await tavily.invoke(query));
  },
  {
    name: "web_search",
    description: "Search the web for current information.",
    schema: z.object({
      query: z.string().describe("The search query to look up"),
    }),
  }
);

// Create the ReAct agent with tools
const tools = [searchTool];

// Create the ReAct agent with system message
const systemMessage = new SystemMessage(
  'You are a helpful AI assistant that uses the ReAct (Reasoning and Acting) pattern. ' +
  'You have access to a web search tool that you can use to find current information. ' +
  'For each response:\n' +
  '1. First explain your thought process\n' +
  '2. If you need to search the web, describe what you\'re searching for\n' +
  '3. Finally provide your response, incorporating any search results\n\n' +
  'Format your response as:\n' +
  'Thought: [your reasoning]\n' +
  'Action: [your action, including any web searches]\n' +
  'Response: [your response to the user]\n\n' +
  'Always maintain context of the conversation and cite sources when using search results.'
);

const reactAgent = createReactAgent({
  llm: model,
  tools,
  messageModifier: systemMessage,
});

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

    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json(
        { error: 'Tavily API key is not configured' },
        { status: 500 }
      );
    }

    // Generate or get session ID from cookies
    const sessionId = request.cookies.get('sessionId')?.value || 
      Math.random().toString(36).substring(7);

    // Get conversation history for this session
    const history = conversationHistory.get(sessionId) || [];

    // Create the current message
    const currentMessage = new HumanMessage(message);

    // Process the message using the ReAct agent with history
    const agentOutput = await reactAgent.invoke({
      messages: [...history, currentMessage]
    });

    // Get the final message from the agent
    const finalMessage = agentOutput.messages[agentOutput.messages.length - 1];
    const result = parseResponse(finalMessage.content as string);

    // Update conversation history with the new exchange
    history.push(
      currentMessage,
      new AIMessage(result.response)
    );
    conversationHistory.set(sessionId, history);

    // Create response with cookie
    const response = NextResponse.json(result);
    
    // Set session cookie if it doesn't exist
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