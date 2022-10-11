import { expect } from "chai";
import request from "supertest";

import app from "../../src/app";

describe("이더리움 체인 정보 확인 테스트", () => {
	it("체인 정보를 확인하면 chainId와 chainName을 반환합니다.", (done) => {
		request(app)
			.get("/api/eth/main/chain")
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.data).to.have.property("chainId");
				expect(res.body.data).to.have.property("chainName");
				// expect(res.body.data.chainId).to.be.equal(5);
				// expect(res.body.data.chainName).to.be.equal("goerli");
				expect(res.body.success).to.be.eql(true);
				done();
			});
	});
});
