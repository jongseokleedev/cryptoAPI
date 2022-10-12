import { expect } from "chai"
import request from "supertest"

import app from "../../src/app"

describe("이더리움 체인 정보 확인 테스트", () => {
	it("체인 정보를 요청하면 chainId와 chainName을 반환합니다.", (done) => {
		request(app)
			.get("/api/eth/chain")
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.data).to.have.property("chainId")
				expect(res.body.data).to.have.property("chainName")
				expect(res.body.success).to.be.eql(true)
				done()
			})
	})
})
