require("dotenv").config();
import { Request, Response } from "express";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

const TESTNET = bitcoin.networks.testnet;
// const TESTNET = {
// 	messagePrefix: "\x18Bitcoin Signed Message:\n",
// 	bech32: "bcy",
// 	bip32: {
// 		public: 0x0488b21e,
// 		private: 0x0488ade4,
// 	},
// 	pubKeyHash: 0x1b,
// 	scriptHash: 0x1f,
// 	wif: 0x80,
// };
// import * as bcypher from "blockcypher";
const bcyTestnetURL = "https://api.blockcypher.com/v1/bcy/test";
const btcTestnetURL = "https://api.blockcypher.com/v1/btc/test3";
const testnetURL = btcTestnetURL;
const bycpher = require("blockcypher");
const axios = require("axios");

const token = process.env.BlockCypherToken;
const TOKEN = JSON.stringify(token);
const newWallet = async (req: Request, res: Response) => {
	// const ECPair = ECPairFactory(ecc);
	// const keyPair = ECPair.makeRandom({ network: TESTNET });
	// const publicKey = keyPair.publicKey.toString("hex");
	// const privateKey = keyPair.privateKey?.toString("hex");
	// const wif = keyPair.toWIF();

	// const { address } = bitcoin.payments.p2wpkh({
	// 	pubkey: keyPair.publicKey,
	// 	network: TESTNET,
	// });
	// https://api.blockcypher.com/v1/btc/main/addrs?token={{TOKEN}}&bech32=true
	const result = await axios
		.post(`${testnetURL}/addrs?bech32=true`)
		.catch((err: any) => {
			// console.log({ err });
			return res.status(500).send({
				err: { err },
			});
		});
	return res.status(200).send({
		success: true,
		message: "지갑 생성 성공",
		// result: result,
		address: result.data.address,
		publicKey: result.data.public,
		privateKey: result.data.private,
		wif: result.data.wif,
	});
};

const balanceOf = async (req: Request, res: Response) => {
	// https://api.blockcypher.com/v1/btc/main/addrs/$ADDRESS/balance?token={{TOKEN}}
	const { address } = req.params;
	const balance = await axios
		.get(`${testnetURL}/addrs/${address}/balance`)
		.catch((err: any) => {
			console.log(err);
		});
	console.log(balance);
	res.status(200).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		balance: balance.data.balance,
		unconfirmed_balance: balance.data.unconfirmed_balance,
		final_balance: balance.data.final_balance,
	});
};

const getFaucet = async (req: Request, res: Response) => {
	const { address, amount } = req.body;
	const result = await axios
		.post(`${testnetURL}/faucet?token=${token}`, {
			address: address,
			amount: amount,
		})
		.catch((err: any) => {
			console.log(err);
			return res.status(500).send({
				success: false,
				err: err,
			});
		});
	res.status(200).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		data: result.data.tx_ref,
	});
};

export { newWallet, balanceOf, getFaucet };
