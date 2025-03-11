import { APIMetadata } from '@/utils/discovery';

const metadata: APIMetadata = {
  name: "LangChain ReAct Chat",
  endpoint: "/api/langchain/react",
  description: "A stateful chat interface using LangChain's ReAct pattern for reasoning and acting",
  method: "POST",
  parameters: {
    message: {
      type: "string",
      required: true,
      description: "The message to send to the AI"
    }
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        response: {
          type: "string",
          description: "The AI's response to the message"
        },
        thought: {
          type: "string",
          description: "The AI's reasoning process"
        },
        action: {
          type: "string",
          description: "The action taken by the AI"
        }
      }
    },
    400: {
      description: "Bad request - missing or invalid parameters",
      content: {
        error: {
          type: "string",
          description: "Error message describing what went wrong"
        }
      }
    },
    500: {
      description: "Server error",
      content: {
        error: {
          type: "string",
          description: "Error message describing what went wrong"
        }
      }
    }
  }
};

export default metadata; 