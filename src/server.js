import express from 'express';
import path, { dirname } from 'path';
import  { fileURLToPath } from 'url';

import authRoutes from "./routes/auth_routes.js";
import todoRoutes from "./routes/todo_routes.js";
import { authMiddleware } from './middlewares/auth_middleware.js';

const app = express();
// Allow the port to be configured through the environment, including Docker.
const PORT = process.env.PORT || 8383;

// ES modules do not provide __dirname, so derive it from import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse JSON request bodies before they reach the route handlers.
app.use(express.json());
// Serve the frontend files from the project's public directory.
app.use(express.static(path.join(__dirname, '../public')));

// Authentication routes are public; todo routes require a valid token.
app.use("/auth", authRoutes);
app.use("/todos", authMiddleware, todoRoutes);

// The static middleware serves the frontend entry point at /.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.get("/health", (req, res) => {
  res.send("App is up and running!")
});

// Listen on all interfaces so the app is reachable from a Docker port mapping.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`App connected on port: ${PORT}`);
});
