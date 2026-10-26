import dotenv from "dotenv";

dotenv.config();

import { ChatMistralAI } from "@langchain/mistralai";
import { TavilySearch } from "@langchain/tavily";
import {
    HumanMessage,
    SystemMessage,
} from "@langchain/core/messages";

const model = new ChatMistralAI({
    model: "mistral-small-latest",
    temperature: 0.3,
    apiKey: process.env.MISTRAL_API_KEY,
});

const tavily = new TavilySearch({
    maxResults: 3,
    apiKey: process.env.TAVILY_API_KEY,
});

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        console.log("AI Message:", message);

        /*
         * First ask Mistral whether the user needs
         * current/web information.
         */
        const classificationResponse = await model.invoke([
            new SystemMessage(
                `You are a routing assistant.

Decide whether the user's question requires current or web-based information.

Return ONLY:
SEARCH
or
NO_SEARCH

Use SEARCH for things such as:
- current news
- current prices
- latest technologies
- recent events
- current company information
- live/current information

Use NO_SEARCH for:
- programming concepts
- DBMS
- operating systems
- computer networks
- mathematics
- general explanations
- coding help
- interview preparation
- questions that do not require current information.`
            ),
            new HumanMessage(message),
        ]);

        const decision =
            classificationResponse.content
                ?.toString()
                .trim()
                .toUpperCase();

        let context = "";

        /*
         * Use Tavily only when web information
         * is actually required.
         */
        if (decision.includes("SEARCH")) {
            try {
                console.log("Tavily search:", message);

                const searchResponse =
                    await tavily.invoke({
                        query: message,
                    });

                context = JSON.stringify(searchResponse);

                console.log("Tavily search completed");
            } catch (searchError) {
                console.error(
                    "Tavily Error:",
                    searchError.message
                );

                // Continue without web results
                context = "";
            }
        }

        /*
         * Generate the final answer.
         */
        const finalResponse = await model.invoke([
            new SystemMessage(
                `You are an AI assistant inside a Student Mock Test Management System.

Your job is to help students with:
- DBMS
- SQL
- Operating Systems
- Computer Networks
- Data Structures and Algorithms
- Programming
- Cloud Computing
- AI/ML
- Software Engineering
- Mock test preparation
- Interview preparation
- General academic questions

Give clear, accurate and easy-to-understand answers.

If web search results are provided, use them when relevant.
Do not claim that you searched the web if no search results were provided.

Web search context:
${context || "No web search was used."}`
            ),
            new HumanMessage(message),
        ]);

        return res.status(200).json({
            success: true,
            reply: finalResponse.content?.toString() || "No response generated.",
        });

    } catch (error) {
        console.error(
            "AI Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "AI service error",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};