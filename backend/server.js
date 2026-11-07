
import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log(`PrepFlow server running on port ${PORT}`);
        });

        const shutdown = () => {
            console.log("Shutting down server...");

            server.close(() => {
                console.log("Server closed.");
                process.exit(0);
            });
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

    } catch (error) {
        console.error("Server startup error:", error);
        process.exit(1);
    }
};

startServer();
