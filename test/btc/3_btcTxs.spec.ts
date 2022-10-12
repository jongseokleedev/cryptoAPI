require("dotenv").config();
import { expect } from "chai";
import request from "supertest";

import app from "../../src/app";
const axios = require("axios");
const bitcoin = require("bitcoinjs-lib");
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import { resourceLimits } from "worker_threads";
const bcyTestnetURL = "https://api.blockcypher.com/v1/bcy/test";
const btcTestnetURL = "https://api.blockcypher.com/v1/btc/test3";
const testnetURL =
	process.env.btcCurrentChain === "bcy"
		? bcyTestnetURL
		: process.env.btcCurrentChain === "btcTest"
		? btcTestnetURL
		: bcyTestnetURL;
const bcyTestnetInfo = process.env.bcyTestnet || {};
const TESTNET =
	process.env.btcCurrentChain === "bcy"
		? bcyTestnetInfo
		: process.env.btcCurrentChain === "btcTest"
		? bitcoin.networks.testnet
		: bcyTestnetInfo;

const token = process.env.BlockCypherToken;

let bcyTestAddr_1 = process.env.bcyTestAddr_1 || "";
let bcyTestAddr_2 = process.env.bcyTestAddr_2 || "";
let btcTestAddr_1 = process.env.btcTestAddr_1 || "";
let btcTestAddr_2 = process.env.btcTestAddr_2 || "";
let bcyTestPk_1 = process.env.bcyTestPk_1 || "";
let bcyTestPk_2 = process.env.bcyTestPk_2 || "";
let btcTestPk_1 = process.env.btcTestPk_1 || "";
let btcTestPk_2 = process.env.btcTestPk_1 || "";
let testAddr_1 =
	process.env.btcCurrentChain === "bcy"
		? bcyTestAddr_1
		: process.env.btcCurrentChain === "btcTest"
		? btcTestAddr_1
		: bcyTestAddr_1;
let testAddr_2 =
	process.env.btcCurrentChain === "bcy"
		? bcyTestAddr_2
		: process.env.btcCurrentChain === "btcTest"
		? btcTestAddr_2
		: bcyTestAddr_2;

let testPk_1 =
	process.env.btcCurrentChain === "bcy"
		? bcyTestPk_1
		: process.env.btcCurrentChain === "btcTest"
		? btcTestPk_1
		: bcyTestPk_1;
let testPk_2 =
	process.env.btcCurrentChain === "bcy"
		? bcyTestPk_2
		: process.env.btcCurrentChain === "btcTest"
		? btcTestPk_2
		: bcyTestPk_2;
const bcyTxHash = process.env.bcyTestTxHash || "";
const btcTxHash = process.env.btcTestTxHash || "";
const txHashExample =
	process.env.btcCurrentChain === "bcy"
		? bcyTxHash
		: process.env.btcCurrentChain === "btcTest"
		? btcTxHash
		: bcyTxHash;

const txExample =
	process.env.btcCurrentChain === "bcy"
		? {
				tx: {
					block_height: -1,
					block_index: -1,
					hash: "c527b3e5152a229d07fdb0ddef104ec0da3546d230a39c9c938092f678996754",
					addresses: [
						"bcy1qar7ynn5rrl4p4rqlajvx22auzxh7dthvspll22",
						"bcy1qgygns7pqq7yg5wdt8jn9funwxv8p8f22ch44yr",
					],
					total: 187200,
					fees: 12800,
					size: 116,
					vsize: 116,
					preference: "high",
					relayed_by: "39.125.68.20",
					received: "2022-10-11T17:17:25.99094601Z",
					ver: 1,
					double_spend: false,
					vin_sz: 2,
					vout_sz: 2,
					confirmations: 0,
					inputs: [
						{
							prev_hash:
								"6f66707921e32e3134748e0c1efaa8d5a50802cd27d3c8b069dcc59241ae66f4",
							output_index: 0,
							output_value: 100000,
							sequence: 4294967295,
							addresses: ["bcy1qar7ynn5rrl4p4rqlajvx22auzxh7dthvspll22"],
							script_type: "pay-to-witness-pubkey-hash",
							age: 492543,
						},
						{
							prev_hash:
								"0a5101cd1ab28de0659c99095d4496cfe9ae0593f0e66cb55343333ca8bccb33",
							output_index: 0,
							output_value: 100000,
							sequence: 4294967295,
							addresses: ["bcy1qar7ynn5rrl4p4rqlajvx22auzxh7dthvspll22"],
							script_type: "pay-to-witness-pubkey-hash",
							age: 493410,
						},
					],
					outputs: [
						{
							value: 100000,
							script: "0014411138782007888a39ab3ca654f26e330e13a54a",
							addresses: ["bcy1qgygns7pqq7yg5wdt8jn9funwxv8p8f22ch44yr"],
							script_type: "pay-to-witness-pubkey-hash",
						},
						{
							value: 87200,
							script: "0014e8fc49ce831fea1a8c1fec98652bbc11afe6aeec",
							addresses: ["bcy1qar7ynn5rrl4p4rqlajvx22auzxh7dthvspll22"],
							script_type: "pay-to-witness-pubkey-hash",
						},
					],
				},
				tosign: [
					"c9d66ea71f64dc40fc1faca0397995f686fc8ab164cdcc233d6831650cb929e4",
					"24086157c2ad3ad4f0479fc04491c120e35277c6740d3e255681a71e0fd5bc87",
				],
		  }
		: process.env.btcCurrentChain === "btcTest"
		? {
				tx: {
					block_height: -1,
					block_index: -1,
					hash: "c39630575f16df18a99b1f9e7c156dba34785aca8d6dbeb2c855909f77cbda36",
					addresses: [
						"tb1qcjpz2w0w800kdt5rtcvdc3yw8d83jvcz2r09dc",
						"tb1qjdx2jsvzddpljurw5j56g8tgjz6fj0xcd7qtks",
					],
					total: 705932,
					fees: 5900,
					size: 116,
					vsize: 116,
					preference: "low",
					relayed_by: "39.125.68.20",
					received: "2022-10-11T17:24:02.280348343Z",
					ver: 1,
					double_spend: false,
					vin_sz: 1,
					vout_sz: 2,
					confirmations: 0,
					inputs: [
						{
							prev_hash:
								"939e53902f38eed536d8e2fd714492c9d617f7bef6eba6d9fc89d2d525258281",
							output_index: 1,
							output_value: 711832,
							sequence: 4294967295,
							addresses: ["tb1qcjpz2w0w800kdt5rtcvdc3yw8d83jvcz2r09dc"],
							script_type: "pay-to-witness-pubkey-hash",
							age: 2350465,
						},
					],
					outputs: [
						{
							value: 100000,
							script: "0014934ca941826b43f9706ea4a9a41d6890b4993cd8",
							addresses: ["tb1qjdx2jsvzddpljurw5j56g8tgjz6fj0xcd7qtks"],
							script_type: "pay-to-witness-pubkey-hash",
						},
						{
							value: 605932,
							script: "0014c4822539ee3bdf66ae835e18dc448e3b4f193302",
							addresses: ["tb1qcjpz2w0w800kdt5rtcvdc3yw8d83jvcz2r09dc"],
							script_type: "pay-to-witness-pubkey-hash",
						},
					],
				},
				tosign: [
					"dc3ef9d084c47162e189dec88ba3ecef0c4f68d2f6e4e54d5fbf5f635828231c",
				],
		  }
		: {};

describe("비트코인 트랜잭션 생성 테스트", () => {
	it("비트코인 트랜잭션을 생성하면 트랜잭션 정보를 반환합니다.", (done) => {
		request(app)
			.post("/api/btc/txs/new")
			.send({ from: testAddr_1, to: testAddr_2, value: 100000 })
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("tx");
				expect(res.body.data.tx.addresses).to.include(testAddr_1);
				expect(res.body.data.tx.addresses).to.include(testAddr_2);
				done();
			});
	});
});
describe("비트코인 트랜잭션 서명 테스트", () => {
	it("비트코인 트랜잭션을 서명하면 서명한 트랜잭션 정보를 반환합니다.", (done) => {
		request(app)
			.post("/api/btc/txs/sign")
			.send({ privateKey: testPk_1, rawTx: txExample })
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("tx");
				expect(res.body.data).to.have.property("tosign");
				expect(res.body.data).to.have.property("signatures");
				expect(res.body.data).to.have.property("pubkeys");
				expect(res.body.data.tx.addresses).to.include(testAddr_1);
				expect(res.body.data.tx.addresses).to.include(testAddr_2);
				done();
			});
	});
});
describe("비트코인 트랜잭션 전송 테스트", () => {
	let preparedTx: any;
	let beforeToBalance = 0;
	let afterToBalance = 0;
	before(async () => {
		let balanceData = await axios.get(
			`${testnetURL}/addrs/${testAddr_2}/balance`
		);
		beforeToBalance = balanceData.data.final_balance;
		//Prepare Transaction for testing send transaction
		const createdTx = await axios.post(`${testnetURL}/txs/new?token=${token}`, {
			inputs: [{ addresses: [testAddr_1] }],
			outputs: [{ addresses: [testAddr_2], value: 100000 }],
		});
		const ECPair = ECPairFactory(ecc);
		const keyPair = ECPair.fromPrivateKey(Buffer.from(testPk_1, "hex"));
		let pubkeys: string[] = [];
		const tmptx = {
			tx: createdTx.data.tx,
			tosign: createdTx.data.tosign,
			pubkeys: pubkeys,
			signatures: [],
		};

		//전달받은 tx에 서명해서 signature를 배열에 추가하고 그에 대응하는 publicKey를 배열에 추가
		tmptx.signatures = tmptx.tosign.map(function (tosign: any, n: any) {
			let pubkey: any = keyPair.publicKey.toString("hex");
			tmptx.pubkeys.push(pubkey);

			return bitcoin.script.signature
				.encode(
					keyPair.sign(Buffer.from(tosign, "hex")),
					bitcoin.Transaction.SIGHASH_ALL
				)
				.toString("hex");
		});
		preparedTx = tmptx;
	});
	it("비트코인 트랜잭션이 네트워크로 전송되어야 합니다.", (done) => {
		request(app)
			.post("/api/btc/txs")
			.send({
				tx: preparedTx.tx,
				tosign: preparedTx.tosign,
				signatures: preparedTx.signatures,
				pubkeys: preparedTx.pubkeys,
			})
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("tx");
				expect(res.body.data.tx.addresses).to.include(testAddr_1);
				expect(res.body.data.tx.addresses).to.include(testAddr_2);
				done();
			});
	});

	it("비트코인 트랜잭션 전송 후 잔고가 전송된 값만큼 증가해야 합니다.", async () => {
		let balanceData = await axios.get(
			`${testnetURL}/addrs/${testAddr_2}/balance`
		);
		afterToBalance = balanceData.data.final_balance;
		expect(beforeToBalance + 100000).to.least(afterToBalance);
	});
});

describe("비트코인 트랜잭션 조회 테스트", () => {
	it("비트코인 트랜잭션 정보를 조회하면 트랜잭션 정보를 반환합니다.", (done) => {
		request(app)
			.get(`/api/btc/txs/${txHashExample}`)
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				done();
			});
	});
});
