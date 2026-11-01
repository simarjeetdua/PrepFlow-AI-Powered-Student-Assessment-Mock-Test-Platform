import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendDirectory = path.resolve(__dirname, "../..")

const databaseServerPath = path.join(
    backendDirectory,
    "mcp",
    "servers",
    "databaseServer.js"
);

//connect to the mcp db server
export const connectDatabaseMcpClient = async()=>{
    const client = new Client({
        name: "prepflow-ai-database-client",
        version: "1.0.0",
        description: "database client for prepflow"
    });

    const transport = new StdioClientTransport({
    command: process.execPath,
    args: [databaseServerPath],
    cwd: backendDirectory,
    env: Object.fromEntries(
      Object.entries(process.env).filter(
        ([, value]) => value !== undefined
      )
    ),
    stderr: "inherit",
  });

  try{
    await client.connect(transport);
    console.log("connected to prepflow database mcp server");
    return client;
  }
   catch (error) {
    console.error("failed to connect to prepflow database mcp server", error);
    throw error;
  }
};

//discover available mcp tools from the databse server
export const getAvailableTools = async(client)=>{
    const response = await client.listTools();
    return response.tools;
}

//execute mcp tools
export const executeMcpTool = async(
    client,
    toolName,
    toolArguments = {}
)=>{
    const result = await client.callTool({
        name: toolName,
        arguments: toolArguments,
    });
     if (result.isError) {
    const errorMessage = result.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\n");

    throw new Error(errorMessage || `MCP tool failed: ${toolName}`);
  }
    return result;
}

export const closeDatabaseMcpClient = async(client)=>{
    if(client)
    {
        await client.close();
        console.log("disconnected from prepflow database mcp server");
    }
}