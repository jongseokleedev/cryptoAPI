require("dotenv").config();
import { expect } from "chai";
import { balanceOfERC20 } from "../src/api/eth/erc20";
import { Request, Response } from "express";
import request from "supertest";

import app from "../src/app";
import Web3 from "web3";

const SepoliaTestnet: string = process.env.SepoliaTestnet || "";
const GoerliTestnet: string = process.env.GoerliTestnet || "";
const provider =
	process.env.CurrentChain === "sepolia"
		? SepoliaTestnet
		: process.env.CurrentChain === "goerli"
		? GoerliTestnet
		: SepoliaTestnet;
console.log(provider);
const web3 = new Web3(new Web3.providers.HttpProvider(provider));
const { toWei, fromWei } = web3.utils;

describe("이더리움 송금 트랜잭션 생성 테스트", () => {
	it("이더리움 트랜잭션이 정상적으로 생성되어야 합니다.", (done) => {
		request(app)
			.post("/api/eth/txs/new")
			.send({
				from: "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d",
				to: "0xf4B46ED43094f40C0b97B5FD15AfBF19c45136B9",
				value: 0.001,
			})
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}

				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("from");
				expect(res.body.data).to.have.property("to");
				expect(res.body.data).to.have.property("value");
				expect(res.body.data).to.have.property("nonce");
				expect(res.body.data).to.have.property("gasPrice");
				expect(res.body.data).to.have.property("gasLimit");
				done();
			});
	});
	it("잘못된 주소로 이더리움 트랜잭션 생성을 요청하면 에러를 반환합니다.", (done) => {
		request(app)
			.post("/api/eth/txs/new")
			.send({
				from: "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d",
				to: "0xf4B46ED43094f40C0b97B5FD15AfBF19c45136B9",
				value: "unexpected value",
			})
			.expect(400)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(false);
				done();
			});
	});
	it("잘못된 값으로 이더리움 트랜잭션 생성을 요청하면 에러를 반환합니다.", (done) => {
		request(app)
			.post("/api/eth/txs/new")
			.send({
				from: "0x123",
				to: "0x456",
				value: 0.001,
			})
			.expect(400)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(false);
				done();
			});
	});
});

describe("이더리움 송금 트랜잭션 서명 테스트", () => {
	it("이더리움 트랜잭션이 정상적으로 서명됩니다.", (done) => {
		const exampleTx = {
			from: "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d",
			to: "0x689d633e6e0635a42fa19defd9a45b8e44d10342",
			nonce: 7,
			gasPrice: "1615965694",
			gasLimit: 210000,
			data: "0xa9059cbb000000000000000000000000f4b46ed43094f40c0b97b5fd15afbf19c45136b90000000000000000000000000000000000000000000000000000000000000064",
		};

		request(app)
			.post("/api/eth/txs/sign")
			.send({
				tx: exampleTx,
				privateKey: process.env.EthPrivateKey_1,
			})
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("rawTransaction");
				done();
			});
	});
	it("잘못된 tx Data로 트랜잭션 서명을 요청하면 에러를 반환합니다.", (done) => {
		const exampleInvalidTx = {
			from: "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d",
			to: "0x689d633e6e0635a42fa19defd9a45b8e44d10342",
			nonce: 7,
			gasPrice: "1615965694",
			gasLimit: 210000,
			data: "invalid data",
		};
		request(app)
			.post("/api/eth/txs/sign")
			.send({
				tx: exampleInvalidTx,
				privateKey: process.env.EthPrivateKey_1,
			})
			.expect(500)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(false);
				done();
			});
	});
});

/*
이더리움 트랜잭션 생성/서명/전송을 차례대로 테스트 합니다.
*/

describe("이더리움 송금 트랜잭션 전송 테스트", () => {
	let rawTransaction = "null";
	let beforeFromBalance = 0;
	let beforeToBalance = 0;
	let afterFromBalance = 0;
	let afterToBalance = 0;
	before(async () => {
		//Prepare Transaction for testing send transaction
		const from = "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d";
		const to = "0xf4B46ED43094f40C0b97B5FD15AfBF19c45136B9";
		beforeFromBalance = Number(fromWei(await web3.eth.getBalance(from)));
		beforeToBalance = Number(fromWei(await web3.eth.getBalance(to)));
		const value = 0.001;
		const nonce = await web3.eth.getTransactionCount(from);
		const networkId = await web3.eth.net.getId();
		const gasPrice = await web3.eth.getGasPrice();

		const tx = {
			from: from,
			to: to,
			value: toWei(value.toString()),
			nonce: nonce,
			gasPrice: gasPrice,
			gasLimit: 210000,
		};
		const privateKey = process.env.EthPrivateKey_1 || "";
		const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

		rawTransaction = signedTx.rawTransaction || "";
	});

	it("이더리움 트랜잭션이 정상적으로 전송되어야 합니다.", (done) => {
		console.log("이더리움 트랜잭션 전송 응답을 기다립니다 ...");
		request(app)
			.post("/api/eth/txs/send")
			.send({
				signedTx: rawTransaction,
			})
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data.status).to.be.eql(true);
				expect(res.body.data).to.have.property("transactionHash");
				done();
			});
	});

	it("이더리움 트랜잭션 전송 후 잔고 확인", async () => {
		const from = "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d";
		const to = "0xf4B46ED43094f40C0b97B5FD15AfBF19c45136B9";
		afterFromBalance = Number(fromWei(await web3.eth.getBalance(from)));
		afterToBalance = Number(fromWei(await web3.eth.getBalance(to)));
		// 0.001 Eth가 잘 전송되었는지 확인
		expect(afterToBalance).to.least(beforeToBalance + 0.001);
	});
});

describe("트랜잭션 조회 테스트", () => {
	it("트랜잭션을 조회하면 ethscan Url을 반환합니다.", (done) => {
		const txHash =
			process.env.CurrentChain === "sepolia"
				? "0x9203d2ea48d3ae7466fb6cb0b2393ced8a155b3ab738ab989ffc6470fc144308"
				: process.env.CurrentChain === "goerli"
				? "0x467b8cbd8c33d7673e0f5b6ea5c779e0f321b692b5aad68ba0c3fb64a62db72e"
				: "0x9203d2ea48d3ae7466fb6cb0b2393ced8a155b3ab738ab989ffc6470fc144308";
		request(app)
			.get(`/api/eth/txs/${txHash}`)
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("etherScanUrl");
				done();
			});
	});
});
