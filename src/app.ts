import express from "express";
import cors from "cors";

import memberRoutes from "./routes/member.route";
import merchantRoutes from "./routes/merchant.routes";
import rewardRoutes from "./routes/reward.routes";       
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/members", memberRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/reward", rewardRoutes);                     


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