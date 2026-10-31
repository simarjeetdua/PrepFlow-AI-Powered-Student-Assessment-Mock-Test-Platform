import "dotenv/config"

import mongoose from "mongoose"
import {McpServer} from "@modelcontextprotocol/server"
import {serveStdio} from "@modelcontextprotocol/server/stdio"
import * as z from "zod/v4"

import Student from "../../models/Student.js"
import testResult from "../../models/TestResult.js"
import mockTest from "../../models/MockTest.js"

// --------------------------------------------------
// 1. Database connection
// --------------------------------------------------

let connectionPromise;

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from .env");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
};

// --------------------------------------------------
// 2. Trusted student identity
// --------------------------------------------------

const getAuthenticatedStudentId = () => {
  const studentId = process.env.MCP_STUDENT_ID;

  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    throw new Error("Valid authenticated student context is missing");
  }

  return studentId;
};

const createServer = async()=>{
    const server = new McpServer({
        name : "prepflow-database-server",
        version: "1.0.0",
        description: "database server for prepflow",
    });

    server.registerTool(     //student profile tool
        "get_my_profile",
        {
            description: "Get the authenticated student's name, email and role.",
            inputSchema: z.object({}),
        },
        async()=>{
            await connectDatabase();

            const studentId = getAuthenticatedStudentId();
            const student = await Student.findById(studentId).select("name email role createdAt").lean();
            
            if(!student)
            {
                throw new Error("Authenticated student not found");
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(student, null, 2),
                    },
                ],
            };
        }
    );

    server.registerTool(    // mock test history tool
        "get_my_mock_tests_history",
        {
            description: "Get the authenticated student's recent mock test attempts and results.",
            inputSchema: z.object({}),
        },
        async()=>{
            await connectDatabase();

            const studentId = getAuthenticatedStudentId();
            const results = await testResult.find({student: studentId,}).populate("mockTest", "title difficulty totalQuestions").sort({submittedAt: -1}).limit(20).lean();

            const history = results.map((result)=>({
                 testTitle: result.mockTest?.title ?? "Unknown test",
                difficulty: result.mockTest?.difficulty ?? "Unknown",
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                incorrectAnswers: result.incorrectAnswers,
                unanswered: result.unanswered,
                score: result.score,
                percentage: result.percentage,
                submittedAt: result.submittedAt,
            }))
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(history, null, 2),
                    },
                ],
            };
        }
    );

    server.registerTool(
        "get_my_performance",
        {
            description: "Calculate the authenticated student's mock test attempts, average percentage, best percentage and answer statistics.",
            inputSchema: z.object({}),
        },
        async()=>{
            await connectDatabase();

            const studentId = getAuthenticatedStudentId();
            const results = await testResult.find({student: studentId}).lean();

            if(results.length === 0)
            {
                return{
                    content: [
                        {
                            type: "text",
                            text: "No mock test attempts found for this student",
                        },
                    ],
                };
            }

            const totalAttempts = results.length;

            const averagePercentage =
                results.reduce((sum, item) => sum + item.percentage, 0) /
                totalAttempts;

            const bestPercentage = Math.max(
                ...results.map((item) => item.percentage)
            );

            const totalCorrectAnswers = results.reduce(
                (sum, item) => sum + item.correctAnswers,
                0
            );

            const totalIncorrectAnswers = results.reduce(
                (sum, item) => sum + item.incorrectAnswers,
                0
            );

            const totalUnanswered = results.reduce(
                (sum, item) => sum + item.unanswered,
                0
            );

            const performance = {
            totalAttempts,
            averagePercentage: Number(averagePercentage.toFixed(2)),
            bestPercentage,
            totalCorrectAnswers,
            totalIncorrectAnswers,
            totalUnanswered,
        };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(performance, null, 2),
                    },
                ],
            };
        }
    );

    return server;
}

//start mcp server
void serveStdio(createServer);
console.error("PrepFlow Database MCP Server started");

