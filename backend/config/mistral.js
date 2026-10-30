import "dotenv/config";
import { Mistral } from "@mistralai/mistralai";

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is missing");
}

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

console.log("Mistral API configured:", true);
console.log(
  "Mistral model:",
  process.env.MISTRAL_MODEL || "mistral-small-latest"
);

export default client;