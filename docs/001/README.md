# LangChain ReAct Agent Implementation

This document explains our implementation of a ReAct (Reasoning and Acting) agent using LangChain. The agent can maintain conversations, perform web searches, and explain its thought process.

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Key Components](#key-components)
4. [Code Walkthrough](#code-walkthrough)
5. [User Interface](#user-interface)
6. [Getting Started](#getting-started)

## Overview

The ReAct agent is an AI assistant that follows the Reasoning and Acting pattern. For each interaction:
1. It thinks about what it needs to do
2. Decides if it needs to search the web
3. Provides a response incorporating any search results
4. Maintains conversation context

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **AI/LLM**: 
  - OpenAI GPT-4 via LangChain
  - Tavily AI for web search
- **UI Components**: React with CSS Modules

## Key Components

### 1. ReAct Agent Route (`src/app/api/langchain/react/route.ts`)

```typescript
// Core imports
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// Initialize the model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
});

// Web search tool setup
const searchTool = tool(
  async ({ query }: { query: string }) => {
    const tavily = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 3,
    });
    return JSON.stringify(await tavily.invoke(query));
  },
  {
    name: "web_search",
    description: "Search the web for current information.",
    schema: z.object({
      query: z.string().describe("The search query to look up"),
    }),
  }
);
```

The agent is configured with:
- GPT-4 as the base model
- Tavily search integration for web access
- Conversation state management
- Structured response formatting

### 2. System Message

The agent uses a system message that defines its behavior:

```typescript
const systemMessage = new SystemMessage(
  'You are a helpful AI assistant that uses the ReAct pattern...' +
  'For each response:\n' +
  '1. First explain your thought process\n' +
  '2. If you need to search the web, describe what you\'re searching for\n' +
  '3. Finally provide your response, incorporating any search results\n\n'
);
```

### 3. Response Structure

Responses are structured in three parts:
- **Thought**: The agent's reasoning process
- **Action**: What the agent did (e.g., web search)
- **Response**: The final answer to the user

## Code Walkthrough

### 1. Agent Creation

```typescript
const reactAgent = createReactAgent({
  llm: model,
  tools: [searchTool],
  messageModifier: systemMessage,
});
```

### 2. Message Processing

```typescript
// Process incoming message
const agentOutput = await reactAgent.invoke({
  messages: [...history, currentMessage]
});

// Parse structured response
const result = parseResponse(finalMessage.content);
```

### 3. State Management

The agent maintains conversation state using:
- Session cookies for user identification
- In-memory message history
- Message structure preservation

## User Interface

The UI adapts based on the API being used:

### Chat Interface (for ReAct API)
- Message history display
- Thought process and actions visibility
- Real-time updates
- Auto-scrolling to latest message

### Standard Interface (for other APIs)
- Form-based input
- Structured response display
- Error handling

## Getting Started

1. **Environment Setup**
   ```bash
   # Install dependencies
   npm install @langchain/core @langchain/openai @langchain/community
   ```

2. **Environment Variables**
   ```env
   OPENAI_API_KEY=your-openai-key
   TAVILY_API_KEY=your-tavily-key
   ```

3. **Usage**
   ```typescript
   // Send a message
   const response = await fetch('/api/langchain/react', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ message: "What's new in AI?" })
   });
   ```

## Response Format

```json
{
  "thought": "I should search for recent AI developments",
  "action": "Searching web for: latest artificial intelligence news and developments",
  "response": "Here are the latest developments in AI..."
}
```

## Best Practices

1. **Error Handling**
   - Always validate API keys
   - Handle network failures gracefully
   - Provide clear error messages

2. **State Management**
   - Use proper session management
   - Maintain conversation context
   - Clear state when appropriate

3. **User Experience**
   - Show loading states
   - Provide feedback for actions
   - Maintain message history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

Creative Commons Legal Code- See LICENSE file for details 