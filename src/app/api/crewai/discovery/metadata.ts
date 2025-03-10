import { APIMetadata } from '@/utils/discovery';

const metadata: APIMetadata = {
  name: "CrewAI APIs",
  endpoint: "/api/crewai",
  description: "APIs using CrewAI for multi-agent collaboration and task execution",
  method: "GET",
  parameters: {},
  responses: {
    200: {
      description: "List of available CrewAI APIs",
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