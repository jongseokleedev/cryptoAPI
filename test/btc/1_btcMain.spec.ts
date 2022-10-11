import { expect } from "chai";
import request from "supertest";

import app from "../../src/app";

describe("비트코인 체인 정보 확인 테스트", () => {
	it("비트코인 체인 정보를 반환합니다.", (done) => {
		request(app)
			.get("/api/btc/main/chain")
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.data).to.have.property("name");
				expect(res.body.data).to.have.property("height");
				expect(res.body.data).to.have.property("hash");
				expect(res.body.success).to.be.eql(true);
				done();
			});
	});
});

describe("BlockCypher 토큰 API Call Limit 확인 테스트", () => {
	it("BlockCypher 토큰 API Call Limit을 반환합니다.", (done) => {
		request(app)
			.get("/api/btc/main/token/95264e11ac974f6ea3d46ed89c635d5c")
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err;
				}
				expect(res.body.data).to.have.property("token");
				expect(res.body.data).to.have.property("limits");
				expect(res.body.data).to.have.property("hits_history");
				expect(res.body.success).to.be.eql(true);
				done();
			});
	});
});
