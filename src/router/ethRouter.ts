import express, { Router } from "express";
import { newMnemonic, newWallet, balanceOf } from "../api/eth/wallet";
import {
	balanceOfERC20,
	createERC20Transaction,
	sendERC20Transaction,
} from "../api/eth/erc20";
import {
	createTransaction,
	signTransaction,
	sendTransaction,
	getTransaction,
} from "../api/eth/txs";
import { getChainInfo } from "../api/eth/main";
const router: Router = express.Router();

//main
router.get("/main/chain", getChainInfo);

//wallet
router.post("/wallet/newMnemonic", newMnemonic);
router.post("/wallet/new", newWallet);
router.get("/wallet/balanceOf/:address", balanceOf);

//erc20
router.get("/erc20/balanceOf/:tokenSymbol/:address", balanceOfERC20);
router.post("/erc20/new/:tokenSymbol", createERC20Transaction);
router.post("/erc20/send", sendERC20Transaction);

//txs
router.post("/txs/new", createTransaction);
router.post("/txs/sign", signTransaction);
router.post("/txs", sendTransaction);
router.get("/txs/:txHash", getTransaction);

export default router;
