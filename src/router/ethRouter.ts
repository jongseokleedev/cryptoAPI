import express, { Router } from "express";
import { wallet } from "../api/btc/btc";
import { newMnemonic, newWallet, balanceOf } from "../api/eth/wallet";
import { balanceOfERC20, createERC20Transaction } from "../api/eth/erc20";
import {
	createTransaction,
	signTransaction,
	sendTransaction,
} from "../api/eth/txs";
const router: Router = express.Router();

router.post("/wallet/newMnemonic", newMnemonic);
router.post("/wallet/new", newWallet);
router.get("/wallet/balanceOf/:address", balanceOf);
router.get("/erc20/balanceOf/:tokenSymbol/:address", balanceOfERC20);

router.post("/txs/new", createTransaction);
router.post("/txs/sign", signTransaction);
router.post("/txs/send", sendTransaction);

router.post("/erc20/new", createERC20Transaction);
export default router;
