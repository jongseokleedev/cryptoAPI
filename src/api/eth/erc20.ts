require("dotenv").config()
import { Request, Response } from "express"
import Web3 from "web3"

//set environment variables
const soohoAbi = require("../../contracts/sooho/soohoERC20abi")
const goerliSoohoContractAddress = require("../../contracts/sooho/goerliSoohoERC20address")
const sepoliaSoohoContractAddress = require("../../contracts/sooho/sepoliaSoohoERC20address")
const SepoliaTestnet: string = process.env.SepoliaTestnet || ""
const GoerliTestnet: string = process.env.GoerliTestnet || ""
const EthMainnet: string = process.env.EthMainnet || ""
const provider =
	process.env.ethCurrentChain === "sepolia"
		? SepoliaTestnet
		: process.env.ethCurrentChain === "goerli"
		? GoerliTestnet
		: process.env.ethCurrentChain == "mainnet"
		? EthMainnet
		: SepoliaTestnet
const soohoContractAddress =
	process.env.ethCurrentChain === "goerli"
		? goerliSoohoContractAddress
		: process.env.ethCurrentChain === "sepolia"
		? sepoliaSoohoContractAddress
		: sepoliaSoohoContractAddress
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const { toWei, fromWei } = web3.utils

const soohoContract = new web3.eth.Contract(soohoAbi, soohoContractAddress)

//ERC20 토큰 잔액 조회
const balanceOfERC20 = async (req: Request, res: Response) => {
	const { address, tokenSymbol } = req.params
	let myContract = soohoContract

	if (tokenSymbol === "sooho") {
		const balance = await myContract.methods.balanceOf(address).call()
		res.status(200).send({
			success: true,
			message: "success",
			data: { tokenBalance: balance },
		})
	} else {
		res.status(400).send({
			message: "Bad Request. Unsupported Token Name",
		})
	}
}

//erc20 트랜잭션 생성
const createERC20Transaction = async (req: Request, res: Response) => {
	const { from, to, value } = req.body
	const { tokenSymbol } = req.params

	try {
		const nonce = await web3.eth.getTransactionCount(from)
		const gasPrice = await web3.eth.getGasPrice()

		let myContract = soohoContract
		let contractAddress = soohoContractAddress

		// 다른 ERC20 토큰 발행시 조건문 추가로 확장
		// if (tokenSymbol === "sooho") {
		// 	const myContract = soohoContract;
		// 	const contractAddress = soohoContractAddress;
		// }

		const tx = {
			from: from,
			to: contractAddress,
			nonce: nonce,
			gasPrice: await web3.eth.getGasPrice(),
			gasLimit: 210000,
			data: await myContract.methods.transfer(to, value * 100).encodeABI(), // decimal value 2를 고려해서 value *100
		}
		if (tokenSymbol === "sooho") {
			res.status(201).send({
				success: true,
				message: "정상적으로 처리되었습니다",
				data: tx,
			})
		} else {
			res.status(400).send({
				message: "Bad Request. Unsupported Token Symbol",
			})
		}
	} catch (err) {
		console.log(err)
	}
}

//erc20 트랜잭션 전송
const sendERC20Transaction = async (req: Request, res: Response) => {
	const { signedTx } = req.body

	const result = await web3.eth.sendSignedTransaction(
		signedTx,
		async (err, result) => {
			if (err) {
				return res.status(400).send({ error: err })
			} else {
				const receipt = await web3.eth.getTransactionReceipt(result)
				return res.status(201).send({
					success: true,
					message: "정상적으로 처리되었습니다",
					data: receipt,
				})
			}
		}
	)
}

export { balanceOfERC20, createERC20Transaction, sendERC20Transaction }
