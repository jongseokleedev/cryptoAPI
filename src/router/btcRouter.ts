import express, { Router } from "express";
import { wallet } from "../api/btc/btc";

const router: Router = express.Router();

router.post("/new", wallet);

export default router;
