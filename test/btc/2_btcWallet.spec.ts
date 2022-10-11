import { expect } from "chai";
import request from "supertest";

import app from "../../src/app";

let bcyTestAddr_1 = process.env.bcyTestAddr_1 || "";
let btcTestAddr_1 = process.env.btcTestAddr_1 || "";

let testAddr_1 =
	process.env.btcCurrentChain === "bcy"
		? bcyTestAddr_1
		: process.env.btcCurrentChain === "btcTest"
		? btcTestAddr_1
		: bcyTestAddr_1;

describe("비트코인 지갑 테스트", () => {
	it("비트코인 지갑을 생성하고 Address,PubKey,PrivateKey,wif를 반환합니다.", (done) => {
		request(app)
			.post("/api/btc/wallet/new")
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("address");
				expect(res.body.data).to.have.property("publicKey");
				expect(res.body.data).to.have.property("privateKey");
				expect(res.body.data).to.have.property("wif");
				done();
			});
	});

	it("비트코인 주소에 맞는 잔액을 반환합니다.", (done) => {
		request(app)
			.get(`/api/btc/wallet/balanceOf/${testAddr_1}`)
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("balance");
				expect(res.body.data).to.have.property("unconfirmed_balance");
				expect(res.body.data).to.have.property("final_balance");
				expect(res.body.data.final_balance).to.be.eql(
					res.body.data.balance + res.body.data.unconfirmed_balance
				);
				done();
			});
	});

	it("비트코인 테스트 코인을 요청합니다.(bcy 테스트넷 only)", (done) => {
		request(app)
			.post("/api/btc/wallet/faucet")
			.send({
				address: "bcy1qar7ynn5rrl4p4rqlajvx22auzxh7dthvspll22",
				amount: 100000,
			})
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.success).to.be.eql(true);
				expect(res.body.data).to.have.property("tx_ref");
				done();
			});
	});
});
