require("dotenv").config();
import { Request, Response } from "express";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
const axios = require("axios");

//set environment variables
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

//p2wpkh wallet 생성
const newWallet = async (req: Request, res: Response) => {
	const result = await axios
		.post(`${testnetURL}/addrs?bech32=true`)
		.catch((err: any) => {
			return res.status(500).send({
				err: { err },
			});
		});
	return res.status(201).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		data: {
			address: result.data.address,
			publicKey: result.data.public,
			privateKey: result.data.private,
			wif: result.data.wif,
		},
	});
};

//비트코인 잔액 확인
const balanceOf = async (req: Request, res: Response) => {
	const { address } = req.params;
	const balance = await axios
		.get(`${testnetURL}/addrs/${address}/balance`)
		.catch((err: any) => {
			console.log(err);
		});
	res.status(200).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		data: {
			balance: balance.data.balance,
			unconfirmed_balance: balance.data.unconfirmed_balance,
			final_balance: balance.data.final_balance,
		},
	});
};

//비트코인 테스트코인 요청
const getFaucet = async (req: Request, res: Response) => {
	const { address, amount } = req.body;
	const result = await axios
		.post(`${testnetURL}/faucet?token=${token}`, {
			address: address,
			amount: amount,
		})
		.catch((err: any) => {
			return res.status(500).send({
				success: false,
				err: err,
			});
		});
	res.status(200).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		data: { tx_ref: result.data.tx_ref },
	});
};

export { newWallet, balanceOf, getFaucet };
