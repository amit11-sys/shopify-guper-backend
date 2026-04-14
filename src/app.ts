import express from "express";
import cors from "cors";

// import webhookRoutes from "./routes/webhook.route";
import memberRoutes from "./routes/member.route";
import { errorMiddleware } from "./middlewares/error.middleware"

const app = express();

app.use(cors());

// app.use(
//   "/webhooks",
//   express.raw({ type: "application/json" }),
//   webhookRoutes
// );

app.use(express.json());

app.use("/api/members", memberRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.use(errorMiddleware);

export default app;