import { expect } from "chai";
import { balanceOfERC20 } from "../src/api/eth/erc20";
import { Request, Response } from "express";
import request from "supertest";

import app from "../src/app";
import Web3 from "web3";
const soohoAbi = require("../src/contracts/sooho/soohoERC20abi");
const goerliSoohoContractAddress = require("../src/contracts/sooho/goerliSoohoERC20address");
const sepoliaSoohoContractAddress = require("../src/contracts/sooho/sepoliaSoohoERC20address");
const SepoliaTestnet: string = process.env.SepoliaTestnet || "";
const GoerliTestnet: string = process.env.GoerliTestnet || "";
const provider =
	process.env.CurrentChain === "sepolia"
		? SepoliaTestnet
		: process.env.CurrentChain === "goerli"
		? GoerliTestnet
		: SepoliaTestnet;
const web3 = new Web3(new Web3.providers.HttpProvider(provider));
const { toWei, fromWei } = web3.utils;

const soohoContractAddress =
	process.env.CurrentChain === "goerli"
		? goerliSoohoContractAddress
		: process.env.CurrentChain === "sepolia"
		? sepoliaSoohoContractAddress
		: sepoliaSoohoContractAddress;
const soohoContract = new web3.eth.Contract(soohoAbi, soohoContractAddress);
let myContract = soohoContract;
let contractAddress = soohoContractAddress;

describe("ERC20 잔액 조회 테스트", () => {
	it("ERC20 SoohoToken 잔액을 정상적으로 반환합니다.", (done) => {
		request(app)
			.get(
				"/api/eth/erc20/balanceOf/sooho/0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d"
			)
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body).to.have.property("tokenBalance");
				expect(res.body.success).to.be.eql(true);
				expect(res.body.tokenBalance).to.least(0); //tokenBalance가 0보다 크다.
				done();
			});
	});
});

describe("ERC20 송금 트랜잭션 생성 테스트", () => {
	it("ERC20 SoohoToken 송금 트랜잭션을 정상적으로 생성합니다.", (done) => {
		const exampleTx = {
			from: "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d",
			to: "0xf4B46ED43094f40C0b97B5FD15AfBF19c45136B9",
			value: 1,
		};
		request(app)
			.post("/api/eth/erc20/new/sooho")
			.send(exampleTx)
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.data).to.have.property("from");
				expect(res.body.data).to.have.property("to");
				expect(res.body.data).to.have.property("nonce");
				expect(res.body.data).to.have.property("gasPrice");
				expect(res.body.data).to.have.property("gasLimit");
				expect(res.body.data).to.have.property("data");
				expect(res.body.success).to.be.eql(true);
				done();
			});
	});
});

describe("ERC20 송금 트랜잭션 전송 테스트", () => {
	let rawTransaction = "null";
	let beforeFromBalance = 0;
	let beforeToBalance = 0;
	let afterFromBalance = 0;
	let afterToBalance = 0;
	before(async () => {
		//Prepare Transaction for testing send ERC20 transaction
		const from = "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d";
		const to = "0xf4B46ED43094f40C0b97B5FD15AfBF19c45136B9";
		const soohoContract = new web3.eth.Contract(soohoAbi, soohoContractAddress);

		//devided by decimal value. in case of sooho, decimal value is 2
		beforeFromBalance = (await myContract.methods.balanceOf(from).call()) / 100;
		beforeToBalance = (await myContract.methods.balanceOf(to).call()) / 100;

		const value = 1;
		const nonce = await web3.eth.getTransactionCount(from);
		const gasPrice = await web3.eth.getGasPrice();
		const tx = {
			from: from,
			to: contractAddress,
			nonce: nonce,
			gasPrice: gasPrice,
			gasLimit: 210000,
			data: await myContract.methods.transfer(to, value * 100).encodeABI(),
		};
		const privateKey = process.env.EthPrivateKey_1 || "";
		const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

		rawTransaction = signedTx.rawTransaction || "";
	});

	it("ERC20 트랜잭션이 정상적으로 전송되어야합니다.", (done) => {
		console.log("ERC20 트랜잭션 전송 응답을 기다립니다 ...");
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

	it("ERC20 트랜잭션 전송 후 잔고가 전송한 수량만큼 증가해야 합니다.", async () => {
		const from = "0x1a188E45972F5Eb710Ee75F4e29a9fe9Fb2cad6d";
		const to = "0xf4B46ED43094f40C0b97B5FD15AfBF19c45136B9";
		afterFromBalance = (await myContract.methods.balanceOf(from).call()) / 100;
		afterToBalance = (await myContract.methods.balanceOf(to).call()) / 100;
		// 1 Sooho Token이 잘 전송되었는지 확인
		console.log({ afterFromBalance });
		console.log({ afterToBalance });
		expect(afterToBalance).to.least(beforeToBalance + 1);
	});
});
