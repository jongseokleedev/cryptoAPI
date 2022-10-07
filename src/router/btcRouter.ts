import express, { Router } from "express";
import { createTransaction } from "../api/btc/txs";
import { balanceOf, getFaucet, newWallet } from "../api/btc/wallet";

const router: Router = express.Router();

router.post("/wallet/new", newWallet);
router.get("/wallet/balanceOf/:address", balanceOf);
router.post("/wallet/faucet", getFaucet);

router.post("/txs/new", createTransaction);
export default router;
