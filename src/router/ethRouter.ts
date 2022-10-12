import express, { Router } from "express"
import { newMnemonic, newWallet, balanceOf } from "../api/eth/wallet"
import { balanceOfERC20, createERC20Transaction } from "../api/eth/erc20"
import {
	createTransaction,
	signTransaction,
	sendTransaction,
	getTransaction,
} from "../api/eth/txs"
import { getChainInfo } from "../api/eth/main"
const router: Router = express.Router()

//main
router.get("/chain", getChainInfo)

//wallet
router.post("/wallet/mnemonic", newMnemonic)
router.post("/wallet", newWallet)
router.get("/wallet/:address", balanceOf)

//erc20
router.get("/erc20/:tokenSymbol/:address", balanceOfERC20)
router.post("/erc20/:tokenSymbol", createERC20Transaction)

//txs
router.post("/txs", createTransaction)
router.post("/txs/sign", signTransaction)
router.post("/txs/send", sendTransaction)
router.get("/txs/:txHash", getTransaction)

export default router
