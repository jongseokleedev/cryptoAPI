require("dotenv").config()
import { Request, Response } from "express"

import ECPairFactory from "ecpair"
import * as ecc from "tiny-secp256k1"
const bitcoin = require("bitcoinjs-lib")

const bycpher = require("blockcypher")
const axios = require("axios")
const buffer = require("buffer")

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

//비트코인 트랜잭션 생성
const createTransaction = async (req: Request, res: Response) => {
	try {
		const { from, to, value } = req.body
		const result = await axios
			.post(`${testnetURL}/txs/new?token=${token}`, {
				inputs: [{ addresses: [from] }],
				outputs: [{ addresses: [to], value: value }],
			})
			.catch((err: any) => {
				console.log(err.response.data.errors)
				return res.status(500).send({
					success: false,
					err: err,
				})
			})
		res.status(201).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: { tx: result.data.tx, tosign: result.data.tosign },
		})
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		})
	}
}

//비트코인 트랜잭션 전송
const sendTransaction = async (req: Request, res: Response) => {
	try {
		const { tx, tosign, signatures, pubkeys } = req.body
		const result = await axios
			.post(`${testnetURL}/txs/send?token=${token}`, {
				tx: tx,
				tosign: tosign,
				signatures: signatures,
				pubkeys: pubkeys,
			})
			.catch((err: any) => {
				console.log(err.response.data.errors)
				return res.status(500).send({
					success: false,
					err: err,
				})
			})

		res.status(201).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: result.data,
		})
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		})
	}
}

//비트코인 트랜잭션 서명
const signTransaction = async (req: Request, res: Response) => {
	try {
		const { privateKey, rawTx } = req.body
		const ECPair = ECPairFactory(ecc)
		const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"))

		const tmptx = rawTx
		tmptx.pubkeys = []

		//전달받은 tx에 서명해서 signature를 배열에 추가하고 그에 대응하는 publicKey를 배열에 추가
		tmptx.signatures = rawTx.tosign.map(function (tosign: any, n: any) {
			tmptx.pubkeys.push(keyPair.publicKey.toString("hex"))

			return bitcoin.script.signature
				.encode(
					keyPair.sign(Buffer.from(tosign, "hex")),
					bitcoin.Transaction.SIGHASH_ALL
				)
				.toString("hex")
		})

		res.status(201).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: {
				tx: tmptx.tx,
				tosign: tmptx.tosign,
				signatures: tmptx.signatures,
				pubkeys: tmptx.pubkeys,
			},
		})
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		})
	}
}

//비트코인 트랜잭션 조회
const getTransaction = async (req: Request, res: Response) => {
	const { txHash } = req.params
	try {
		const result = await axios
			.get(`${testnetURL}/txs/${txHash}?token=${token}`)
			.catch((err: any) => {
				return res.status(500).send({
					success: false,
					err: err,
				})
			})

		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: result.data,
		})
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		})
	}
}

export { createTransaction, signTransaction, sendTransaction, getTransaction }
