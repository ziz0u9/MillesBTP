import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
(async () => {
  await registerRoutes(app);
})();

// Export for Vercel serverless
export default app;

