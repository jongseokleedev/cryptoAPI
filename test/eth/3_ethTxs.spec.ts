require("dotenv").config()
import { expect } from "chai"
import { balanceOfERC20 } from "../../src/api/eth/erc20"
import { Request, Response } from "express"
import request from "supertest"

import app from "../../src/app"
import Web3 from "web3"

const SepoliaTestnet: string = process.env.SepoliaTestnet || ""
const GoerliTestnet: string = process.env.GoerliTestnet || ""
const provider =
	process.env.ethCurrentChain === "sepolia"
		? SepoliaTestnet
		: process.env.ethCurrentChain === "goerli"
		? GoerliTestnet
		: SepoliaTestnet

const testAddr_1 = process.env.ethAddr_1 || ""
const testAddr_2 = process.env.ethAddr_2 || ""
const testPk_1 = process.env.ethPk_1 || ""
const testPk_2 = process.env.ethPk_2 || ""

const web3 = new Web3(new Web3.providers.HttpProvider(provider))
const { toWei, fromWei } = web3.utils

describe("이더리움 송금 트랜잭션 생성 테스트", () => {
	it("이더리움 트랜잭션이 정상적으로 생성되어야 합니다.", (done) => {
		request(app)
			.post("/api/eth/txs")
			.send({
				from: testAddr_1,
				to: testAddr_2,
				value: 0.001,
			})
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err
				}

				expect(res.body.success).to.be.eql(true)
				expect(res.body.data).to.have.property("from")
				expect(res.body.data).to.have.property("to")
				expect(res.body.data).to.have.property("value")
				expect(res.body.data).to.have.property("nonce")
				expect(res.body.data).to.have.property("gasPrice")
				expect(res.body.data).to.have.property("gasLimit")
				done()
			})
	})
	it("잘못된 주소로 이더리움 트랜잭션 생성을 요청하면 에러를 반환합니다.", (done) => {
		request(app)
			.post("/api/eth/txs")
			.send({
				from: testAddr_1,
				to: testAddr_2,
				value: "unexpected value",
			})
			.expect(400)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(false)
				done()
			})
	})
	it("잘못된 값으로 이더리움 트랜잭션 생성을 요청하면 에러를 반환합니다.", (done) => {
		request(app)
			.post("/api/eth/txs")
			.send({
				from: "0x123", //invalid Address
				to: "0x456", //invalid Address
				value: 0.001,
			})
			.expect(400)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(false)
				done()
			})
	})
})

describe("이더리움 송금 트랜잭션 서명 테스트", () => {
	it("이더리움 트랜잭션이 정상적으로 서명됩니다.", (done) => {
		const exampleTx = {
			from: testAddr_1,
			to: testAddr_2,
			nonce: 7,
			gasPrice: "1615965694",
			gasLimit: 210000,
			data: "0xa9059cbb000000000000000000000000f4b46ed43094f40c0b97b5fd15afbf19c45136b90000000000000000000000000000000000000000000000000000000000000064",
		}

		request(app)
			.post("/api/eth/txs/sign")
			.send({
				tx: exampleTx,
				privateKey: testPk_1,
			})
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(true)
				expect(res.body.data).to.have.property("rawTransaction")
				done()
			})
	})
	it("잘못된 tx Data로 트랜잭션 서명을 요청하면 에러를 반환합니다.", (done) => {
		const exampleInvalidTx = {
			from: testAddr_1,
			to: testAddr_2,
			nonce: 7,
			gasPrice: "1615965694",
			gasLimit: 210000,
			data: "invalid data",
		}
		request(app)
			.post("/api/eth/txs/sign")
			.send({
				tx: exampleInvalidTx,
				privateKey: testPk_1,
			})
			.expect(500)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(false)
				done()
			})
	})
})

/*
이더리움 트랜잭션 생성/서명/전송을 차례대로 테스트 합니다.
*/

describe("이더리움 송금 트랜잭션 전송 테스트", () => {
	let rawTransaction = "null"
	let beforeFromBalance = 0
	let beforeToBalance = 0
	let afterFromBalance = 0
	let afterToBalance = 0
	before(async () => {
		//Prepare Transaction for testing send transaction
		const from = testAddr_1
		const to = testAddr_2
		beforeFromBalance = Number(fromWei(await web3.eth.getBalance(from)))
		beforeToBalance = Number(fromWei(await web3.eth.getBalance(to)))
		const value = 0.001
		const nonce = await web3.eth.getTransactionCount(from)
		const networkId = await web3.eth.net.getId()
		const gasPrice = await web3.eth.getGasPrice()

		const tx = {
			from: from,
			to: to,
			value: toWei(value.toString()),
			nonce: nonce,
			gasPrice: gasPrice,
			gasLimit: 210000,
		}
		const privateKey = testPk_1
		const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)

		rawTransaction = signedTx.rawTransaction || ""
	})

	it("이더리움 트랜잭션이 정상적으로 전송되어야 합니다.", (done) => {
		console.log("이더리움 트랜잭션 전송 응답을 기다립니다 ...")
		request(app)
			.post("/api/eth/txs/send")
			.send({
				signedTx: rawTransaction,
			})
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(true)
				expect(res.body.data.status).to.be.eql(true)
				expect(res.body.data).to.have.property("transactionHash")
				done()
			})
	})

	it("이더리움 트랜잭션 전송 후 잔고가 전송된 값만큼 증가해야 합니다.", async () => {
		const from = testAddr_1
		const to = testAddr_2
		afterFromBalance = Number(fromWei(await web3.eth.getBalance(from)))
		afterToBalance = Number(fromWei(await web3.eth.getBalance(to)))
		// 0.001 Eth가 잘 전송되었는지 확인
		expect(Math.round((beforeToBalance + 0.001) * 10000) / 10000).to.least(
			Math.round(afterToBalance * 10000) / 10000
		)
	})
})

describe("트랜잭션 조회 테스트", () => {
	it("트랜잭션을 조회하면 ethscan Url을 반환합니다.", (done) => {
		const txHash =
			process.env.CurrentChain === "sepolia"
				? process.env.SepoliaTxHash
				: process.env.CurrentChain === "goerli"
				? process.env.GoerliTxHash
				: process.env.SepoliaTxHash
		request(app)
			.get(`/api/eth/txs/${txHash}`)
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(true)
				expect(res.body.data).to.have.property("etherScanUrl")
				done()
			})
	})
})
