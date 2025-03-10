import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apis: [
      {
        name: "CrewAI Task Planning",
        endpoint: "/api/crewai/plan",
        description: "AI-powered task planning and delegation system using CrewAI's agent collaboration framework",
        method: "POST",
        parameters: {
          goal: {
            type: "string",
            required: true,
            description: "The high-level goal or project to be planned"
          },
          constraints: {
            type: "array",
            required: false,
            description: "List of constraints or requirements for the project",
            items: {
              type: "string"
            }
          },
          deadline: {
            type: "string",
            required: false,
            description: "Optional deadline in ISO 8601 format"
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              tasks: {
                type: "array",
                description: "List of planned tasks with assigned agents"
              },
              timeline: {
                type: "object",
                description: "Estimated timeline for task completion"
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
        name: "CrewAI Task Execution",
        endpoint: "/api/crewai/execute",
        description: "Execute planned tasks using a crew of AI agents with different roles and capabilities",
        method: "POST",
        parameters: {
          taskId: {
            type: "string",
            required: true,
            description: "ID of the planned task set to execute"
          },
          agentConfig: {
            type: "object",
            required: false,
            description: "Optional configuration for agent behaviors and constraints"
          }
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              results: {
                type: "array",
                description: "Results from each completed task"
              },
              metrics: {
                type: "object",
                description: "Performance metrics and execution statistics"
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