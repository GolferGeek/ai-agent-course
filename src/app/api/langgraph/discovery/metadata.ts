import { APIMetadata } from '@/utils/discovery';

const metadata: APIMetadata = {
  name: "LangGraph APIs",
  endpoint: "/api/langgraph",
  description: "APIs leveraging LangGraph for complex AI workflow orchestration",
  method: "GET",
  parameters: {},
  responses: {
    200: {
      description: "List of available LangGraph APIs",
      content: {
        apis: {
          type: "array",
          description: "Array of available APIs"
        }
      }
    }
  }
};

export default metadata; 