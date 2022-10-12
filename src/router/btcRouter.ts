import express, { Router } from "express";
import { getChainInfo, getTokenInfo } from "../api/btc/main";

import {
	createTransaction,
	getTransaction,
	sendTransaction,
	signTransaction,
} from "../api/btc/txs";
import { balanceOf, getFaucet, newWallet } from "../api/btc/wallet";

const router: Router = express.Router();

//main
router.get("/main/chain", getChainInfo);
router.get("/main/token/:token", getTokenInfo);

//wallet
router.post("/wallet/new", newWallet);
router.get("/wallet/balanceOf/:address", balanceOf);
router.post("/wallet/faucet", getFaucet);

//txs
router.post("/txs/new", createTransaction);
router.post("/txs/sign", signTransaction);
router.post("/txs", sendTransaction);
router.get("/txs/:txHash", getTransaction);

export default router;
