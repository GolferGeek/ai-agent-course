import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apis: [
      {
        name: "LangGraph Workflow",
        endpoint: "/api/langgraph/workflow",
        description: "Create and execute complex AI workflows using LangGraph's graph-based orchestration",
        method: "POST",
        parameters: {
          workflow: {
            type: "object",
            required: true,
            description: "The workflow definition including nodes and edges",
            properties: {
              nodes: {
                type: "array",
                description: "List of workflow nodes with their configurations"
              },
              edges: {
                type: "array",
                description: "Connections between workflow nodes"
              }
            }
          },
          input: {
            type: "object",
            required: true,
            description: "Initial input data for the workflow"
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              output: {
                type: "object",
                description: "Final output from the workflow"
              },
              executionPath: {
                type: "array",
                description: "Sequence of nodes executed in the workflow"
              }
            }
          },
          400: {
            description: "Bad request - invalid workflow definition or input",
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
        name: "LangGraph State Management",
        endpoint: "/api/langgraph/state",
        description: "Manage and track state for long-running AI workflows",
        method: "POST",
        parameters: {
          workflowId: {
            type: "string",
            required: true,
            description: "ID of the workflow to manage"
          },
          action: {
            type: "string",
            required: true,
            description: "State management action to perform",
            enum: ["save", "load", "update", "delete"]
          },
          state: {
            type: "object",
            required: false,
            description: "State data (required for save and update actions)"
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              state: {
                type: "object",
                description: "Current workflow state"
              },
              timestamp: {
                type: "string",
                description: "Timestamp of the state operation"
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