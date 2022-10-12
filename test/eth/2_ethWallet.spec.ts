import { expect } from "chai"
import request from "supertest"

import app from "../../src/app"

const testAddr_1 = process.env.ethAddr_1 || ""
const testMnemonic_1 = process.env.ethMnemonic_1 || ""
describe("이더리움 지갑 테스트", () => {
	it("니모닉 코드 생성하면 12개 니모닉 코드를 반환합니다.", (done) => {
		request(app)
			.post("/api/eth/wallet/newMnemonic")
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err
				}
				const mnemonic = res.body.mnemonic.split(" ")
				expect(res.body).to.have.property("mnemonic")
				expect(res.body.success).to.be.eql(true)
				// 12개의 니모닉 코드 생성 확인
				expect(mnemonic).to.have.lengthOf(12)
				done()
			})
	})
	it("12개의 니모닉 코드로 이더리움 지갑을 생성할 수 있어야 합니다.", (done) => {
		request(app)
			.post("/api/eth/wallet/new")
			.send({
				password: "1q2w3e4r",
				mnemonic: testMnemonic_1,
			})
			.expect(201)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.data).to.have.property("privateKey")
				expect(res.body.data).to.have.property("address")
				expect(res.body.success).to.be.eql(true)
				// 12개의 니모닉 코드 생성 확인
				done()
			})
	})
	it("11개의 니모닉 코드를 입력하면 에러를 반환합니다.", (done) => {
		request(app)
			.post("/api/eth/wallet/new")
			.send({
				password: "1q2w3e4r",
				mnemonic:
					"exist blur few deer whale final raw plunge develop permit soap",
			})
			.expect(400)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(false)
				// 12개의 니모닉 코드 생성 확인
				done()
			})
	})
	it("이더리움 주소에 맞는 잔액을 반환합니다.", (done) => {
		request(app)
			.get(`/api/eth/wallet/balanceOf/${testAddr_1}`)
			.expect(200)
			.end((err, res) => {
				if (err) {
					throw err
				}
				expect(res.body.success).to.be.eql(true)
				expect(Number(res.body.data.ethBalance)).to.least(0) //eth 잔액이 0이상이어야 합니다.
				done()
			})
	})

	it("유효하지 않은 이더리움 주소를 입력하면 에러를 반환합니다.", (done) => {
		request(app)
			.get("/api/eth/wallet/balanceOf/0x123") //invalid Address
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
