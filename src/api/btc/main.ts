require("dotenv").config()
import { Request, Response } from "express"
const bitcoin = require("bitcoinjs-lib")
const axios = require("axios")

//set environment variables
const bcyTestnetURL = "https://api.blockcypher.com/v1/bcy/test"
const btcTestnetURL = "https://api.blockcypher.com/v1/btc/test3"
const testnetURL =
	process.env.btcCurrentChain === "bcy"
		? bcyTestnetURL
		: process.env.btcCurrentChain === "btcTest"
		? btcTestnetURL
		: bcyTestnetURL
const bcyTestnetInfo = process.env.bcyTestnet || {}
const TESTNET =
	process.env.btcCurrentChain === "bcy"
		? bcyTestnetInfo
		: process.env.btcCurrentChain === "btcTest"
		? bitcoin.networks.testnet
		: bcyTestnetInfo

const token = process.env.BlockCypherToken

//체인 정보 조회
const getChainInfo = async (req: Request, res: Response) => {
	try {
		const chainInfo = await axios.get(`${testnetURL}`).catch((err: any) => {
			console.log(err)
			return res.status(500).send({
				success: false,
				err: err,
			})
		})

		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: chainInfo.data,
		})
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		})
	}
}

// blockcypher 토큰 정보 조회
const getTokenInfo = async (req: Request, res: Response) => {
	try {
		let tokenInput = req.params.token
		const tokenInfo = await axios
			.get(`https://api.blockcypher.com/v1/tokens/${tokenInput}`)
			.catch((err: any) => {
				return res.status(500).send({
					success: false,
					err: err,
				})
			})

		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: tokenInfo.data,
		})
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		})
	}
}

export { getChainInfo, getTokenInfo }
