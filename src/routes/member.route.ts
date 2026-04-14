import express from "express";
import { connectMember } from "../controller/member.controller"

const router = express.Router();

router.post("/connect", connectMember);

export default router;