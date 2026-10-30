import dotenv from "dotenv";
import { generateMistralResponse } from "./services/mistralService.js"
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup error:", error);
        process.exit(1);
    }
};

const testAI = async ()=>{
    const response = await generateMistralResponse(
        "Explain MCP server in simple words"
    )
    console.log("Mistral Response:", response)
};

testAI();


startServer();