import { NextRequest, NextResponse } from "next/server";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";

// Define the tools for the agent to use
const tools = [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
const model = new ChatOpenAI({
  temperature: 0,
}).bindTools(tools);

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
  console.log('Current state messages:', state.messages);
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

// Define the graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Compile it into a LangChain Runnable with the checkpointer
const app = workflow.compile({ checkpointer: agentCheckpointer });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, thread_id = crypto.randomUUID() } = body;

    console.log('Received request:', { message, thread_id });

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // The MemorySaver will automatically load previous messages based on thread_id
    const result = await app.invoke(
      { messages: [new HumanMessage(message)] },
      { 
        configurable: { 
          thread_id,
          checkpointSaver: agentCheckpointer
        }
      }
    );
    
    console.log('Result messages:', result.messages);
    const response = result.messages[result.messages.length - 1].content;
    
    return NextResponse.json({ 
      response,
      thread_id 
    });

  } catch (error) {
    console.error("Error in LangGraph React Memory agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 