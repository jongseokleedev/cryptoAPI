import express, { Router } from "express";
import { regtest } from "../api/btc/regtest";
import {
	createTransaction,
	sendTransaction,
	signTransaction,
} from "../api/btc/txs";
import { balanceOf, getFaucet, newWallet } from "../api/btc/wallet";

const router: Router = express.Router();

router.post("/wallet/new", newWallet);
router.get("/wallet/balanceOf/:address", balanceOf);
router.post("/wallet/faucet", getFaucet);

router.post("/txs/new", createTransaction);
router.post("/txs/sign", signTransaction);
router.post("/txs/send", sendTransaction);
router.post("/regtest", regtest);
export default router;
