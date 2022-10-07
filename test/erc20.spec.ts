import { expect } from "chai";
import { balanceOfERC20 } from "../src/api/eth/erc20";
import { Request, Response } from "express";
import request from "supertest";

import app from "../src/app";

// describe("GET http://localhost:5000", () => {
// 	it("200을 리턴해야 한다.", (done) => {
// 		request(app).get(
// 			"http://localhost:5000",
// 			(err: object, res: Response, body: string) => {
// 				console.log({ res });
// 				expect(res.statusCode).to.equal(200);
// 				done();
// 			}
// 		);
// 	});
// });

describe("ERC20테스트", () => {
	it("ERC20 SoohoToken 잔액 확인", (done) => {
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
