import app from "./app"
import dotenv from "dotenv";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Closing server...`);

  server.close(() => {
    console.log("Server closed gracefully.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Force exiting...");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));