import { APIMetadata } from '@/utils/discovery';

const metadata: APIMetadata = {
  name: "LangChain APIs",
  endpoint: "/api/langchain",
  description: "APIs powered by the LangChain framework for building LLM applications",
  method: "GET",
  parameters: {},
  responses: {
    200: {
      description: "List of available LangChain APIs",
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