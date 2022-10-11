// inside an async function to use await
import { Request, Response } from "express";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
// bitcoinjs-lib must be the >=5.0.6 to use.
// For bitcoinjs-lib >=4.0.3, use version v0.0.8 of regtest-client
const bitcoin = require("bitcoinjs-lib");
const APIPASS = process.env.APIPASS || "satoshi";
const APIURL = process.env.APIURL || "https://regtest.bitbank.cc/1";
const { RegtestUtils } = require("regtest-client");
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

const network = regtestUtils.network; // regtest network params
const ECPair = ECPairFactory(ecc);
const keyPair = ECPair.makeRandom({ network });
const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });

const regtest = async (req: Request, res: Response) => {
	console.log("1");
	const unspent = await regtestUtils.faucet(p2wpkh.address, 2e4);
	console.log({ unspent });
	// const unspentComplex = await regtestUtils
	// 	.faucetComplex(p2pkh.output, 1e4)
	// 	.then(console.log);
	// console.log("1");
	// // Get all current unspents of the address.
	// const unspents = await regtestUtils.unspents(p2pkh.address).then(console.log);
	// console.log("1");
	const fetchedTx = await regtestUtils.fetch(unspent.txId);
	console.log(fetchedTx.outs);
	res.status(201).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		data: {
			// signature: tmptx.signatures,
			// pubkeys: tmptx.pubkeys,
		},
	});
};

export { regtest };
