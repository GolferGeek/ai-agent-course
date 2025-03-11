import { APIMetadata } from '@/utils/discovery';

const metadata: APIMetadata = {
  name: "React Memory Agent",
  endpoint: "/api/langgraph/react-memory",
  description: "An intelligent agent using LangGraph's React pattern with memory to process requests",
  method: "POST",
  parameters: {
    message: {
      type: "string",
      description: "The message to process",
      required: true
    }
  },
  state: {
    thread_id: {
      type: "string",
      description: "Unique identifier for the conversation thread",
      key: "thread_id",
      persist: true
    }
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        response: {
          type: "string",
          description: "The agent's response message"
        },
        thread_id: {
          type: "string",
          description: "The conversation thread identifier"
        }
      }
    },
    400: {
      description: "Bad request - message is missing"
    },
    500: {
      description: "Server error or external API error"
    }
  }
};

export default metadata; 