import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "LangGraph React Memory Agent",
    description: "An agent that uses LangGraph's React pattern with memory to process requests and maintain conversation context",
    endpoint: "/api/langgraph/react-memory",
    parameters: {
      message: {
        type: "string",
        description: "The message to process",
        required: true
      },
      previousMessages: {
        type: "array",
        description: "Array of previous messages in the conversation for context",
        required: false,
        default: []
      }
    },
    response: {
      type: "object",
      properties: {
        response: {
          type: "string",
          description: "The agent's response message"
        },
        messages: {
          type: "array",
          description: "The complete conversation history including the new response"
        }
      }
    },
    errors: {
      400: "Message is required",
      500: "Internal server error"
    }
  });
} 