import { APIMetadata } from '@/utils/discovery';

const metadata: APIMetadata = {
  name: "Generic Chat API",
  endpoint: "/api/generic/chat",
  description: "A simple chat interface that processes messages using OpenAI's API",
  method: "POST",
  parameters: {
    prompt: {
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
          description: "The AI's response to the prompt"
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