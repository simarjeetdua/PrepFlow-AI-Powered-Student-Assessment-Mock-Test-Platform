import {
    connectDatabaseMcpClient,
     getAvailableTools, 
     executeMcpTool, 
     closeDatabaseMcpClient
    } from "./clients/mcpClient.js";

    const main = async()=>{
        let client;
        try{
            client = await connectDatabaseMcpClient();

             console.log("\n--- AVAILABLE MCP TOOLS ---");

             const tools = await getAvailableTools(client);

             tools.forEach((tool, index) => {
                console.log(`${index + 1}. ${tool.name}`);
                console.log(`   ${tool.description}`);
                });

             console.log("\n--- STUDENT PROFILE ---");

             const profile = await executeMcpTool(
                client,
                "get_my_profile",
                {}
            );
            profile.content.forEach((item) => {
            if (item.type === "text") {
                console.log(item.text);
            }
            });

             console.log("\n--- MOCK TEST HISTORY ---");

             const history = await executeMcpTool(
                client,
                "get_my_mock_tests_history",
                {}
             );
             history.content.forEach((item) => {
                if (item.type === "text") {
                    console.log(item.text);
                }
            });

             console.log("\n--- STUDENT PERFORMANCE ---");

             const performance = await executeMcpTool(
                client,
                "get_my_performance",
                {}
             );
             performance.content.forEach((item) => {
                if (item.type === "text") {
                    console.log(item.text);
                }
            });
        }
        catch(error)
        {
            console.error("Error during MCP client operations:", error);
            process.exitCode = 1;
        }
        finally{
            if(client)
            {
                await closeDatabaseMcpClient(client);
                console.log("closed connection to prepflow database mcp server");
            }
        }
    };
    main()


