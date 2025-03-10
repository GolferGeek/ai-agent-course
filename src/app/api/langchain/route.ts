import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apis: [
      {
        name: "LangChain Chat",
        endpoint: "/api/langchain/chat",
        description: "Chat interface powered by LangChain, supporting conversation memory and different LLM models",
        method: "POST",
        parameters: {
          prompt: {
            type: "string",
            required: true,
            description: "The user's message to process"
          },
          model: {
            type: "string",
            required: false,
            description: "The LLM model to use (defaults to gpt-3.5-turbo)",
            enum: ["gpt-3.5-turbo", "gpt-4"]
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              response: {
                type: "string",
                description: "The AI's response"
              },
              tokens: {
                type: "number",
                description: "Number of tokens used in the conversation"
              }
            }
          },
          400: {
            description: "Bad request - invalid parameters",
            content: {
              error: {
                type: "string",
                description: "Error message describing the issue"
              }
            }
          }
        }
      },
      {
        name: "LangChain Document QA",
        endpoint: "/api/langchain/document-qa",
        description: "Question-answering system for documents using LangChain's document loading and querying capabilities",
        method: "POST",
        parameters: {
          question: {
            type: "string",
            required: true,
            description: "The question to ask about the document"
          },
          document: {
            type: "file",
            required: true,
            description: "The document to analyze (PDF, TXT, or DOCX)",
            mimeTypes: ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              answer: {
                type: "string",
                description: "The answer extracted from the document"
              },
              sources: {
                type: "array",
                description: "References to relevant parts of the document"
              }
            }
          },
          400: {
            description: "Bad request - invalid parameters or unsupported file type",
            content: {
              error: {
                type: "string",
                description: "Error message describing the issue"
              }
            }
          }
        }
      }
    ]
  });
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