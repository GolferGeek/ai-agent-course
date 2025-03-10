import { APIMetadata } from '@/utils/discovery';

const metadata: APIMetadata = {
  name: "Generic APIs",
  endpoint: "/api/generic",
  description: "A collection of basic API implementations without specific frameworks",
  method: "GET",
  parameters: {},
  responses: {
    200: {
      description: "List of available Generic APIs",
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