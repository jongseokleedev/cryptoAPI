import express, { Router } from "express"
import { getChainInfo, getTokenInfo } from "../api/btc/main"

import {
	createTransaction,
	getTransaction,
	sendTransaction,
	signTransaction,
} from "../api/btc/txs"
import { balanceOf, getFaucet, newWallet } from "../api/btc/wallet"

const router: Router = express.Router()

//main
router.get("/chain", getChainInfo)
router.get("/token/:token", getTokenInfo)

//wallet
router.post("/wallet", newWallet)
router.get("/wallet/:address", balanceOf)
router.post("/wallet/faucet", getFaucet)

//txs
router.post("/txs", createTransaction)
router.post("/txs/sign", signTransaction)
router.post("/txs/send", sendTransaction)
router.get("/txs/:txHash", getTransaction)

export default router
