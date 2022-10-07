require("dotenv").config();
import { Request, Response } from "express";
import * as bitcoin from "bitcoinjs-lib";

// const TESTNET = bitcoin.networks.testnet;

// import * as bcypher from "blockcypher";
const testnetURL = "https://api.blockcypher.com/v1/bcy/test";
const bycpher = require("blockcypher");
const axios = require("axios");

const token = process.env.BlockCypherToken;

const createTransaction = async (req: Request, res: Response) => {
	const { from, to, value } = req.body;

	const result = await axios
		.post(`${testnetURL}/txs/new?token=${token}`, {
			inputs: [{ addresses: [from] }],
			outputs: [{ addresses: [to], value: value }],
		})
		.catch((err: any) => {
			console.log(err);
			return res.status(500).send({
				success: false,
				err: err,
			});
		});
	console.log({ result });

	res.status(201).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		data: { tx: result.data.tx, tosign: result.data.tosign },
	});
};

export { createTransaction };
