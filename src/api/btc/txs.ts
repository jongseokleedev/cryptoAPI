require("dotenv").config();
import { Request, Response } from "express";

// import * as bcypher from "blockcypher";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";

// const ECPair = ECPairFactory(ecc);
const testnetURL = "https://api.blockcypher.com/v1/bcy/test";
// import bitcoin from "bitcoinjs-lib";
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");
const bycpher = require("blockcypher");
const axios = require("axios");
const buffer = require("buffer");
const TESTNET = {
	messagePrefix: "\x18Bitcoin Signed Message:\n",
	bech32: "bcy",
	bip32: {
		public: 0x0488b21e,
		private: 0x0488ade4,
	},
	pubKeyHash: 0x1b,
	scriptHash: 0x1f,
	wif: 0x49,
};
const token = process.env.BlockCypherToken;

// const createTransaction = async (req: Request, res: Response) => {
// 	const { from, to, value } = req.body;
// 	let tx = new bitcoin.Transaction();
// 	tx.network = TESTNET;

// 	// tx.addInput(txid, outputNumber);

// 	console.log(tx);
// 	// const result = await axios
// 	// 	.post(`${testnetURL}/txs/new?token=${token}`, {
// 	// 		inputs: [{ addresses: [from] }],
// 	// 		outputs: [{ addresses: [to], value: value }],
// 	// 	})
// 	// 	.catch((err: any) => {
// 	// 		console.log(err);
// 	// 		return res.status(500).send({
// 	// 			success: false,
// 	// 			err: err,
// 	// 		});
// 	// 	});
// 	// // console.log(result.pubkeys);

// 	res.status(201).send({
// 		success: true,
// 		message: "정상적으로 처리되었습니다.",
// 		// data: { tx: result.data.tx, tosign: result.data.tosign },
// 	});
// };

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
	// console.log(result.pubkeys);
	console.log({ result });
	res.status(201).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		data: { tx: result.data.tx, tosign: result.data.tosign },
	});
};

const sendTransaction = async (req: Request, res: Response) => {
	const { tx, tosign, signature, pubkeys } = req.body;
	const result = await axios
		.post(`${testnetURL}/txs/send?token=${token}`, {
			tx: tx,
			tosign: tosign,
			signature: signature,
			pubkeys: pubkeys,
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
		data: result.data,
	});
};

const signTransaction = async (req: Request, res: Response) => {
	const { privateKey, rawTx } = req.body;
	const ECPair = ECPairFactory(ecc);
	const keyPair = ECPair.fromWIF(
		"Bpq8UL3TdrHyAi9K1byqQBFW4pmUEWQpZ1A4DkjK4D94joTiSiXN",
		TESTNET
	);

	// const tmptx = rawTx;
	// tmptx.pubkeys = [];
	// tmptx.signatures = rawTx.tosign.map(function (tosign: any, n: any) {
	// 	tmptx.pubkeys.push(keyPair.publicKey.toString("hex"));
	// 	// return bitcoin.script.signature
	// 	// 	.encode(keyPair.sign(new buffer.Buffer(tosign, "hex")), 0x01)
	// 	// 	.toString("hex");
	// 	return keyPair.sign(new buffer.Buffer(tosign, "hex")).toString("hex");
	// });

	// 	// const SIGNHASH_ALL = 0x01;
	// 	// const result = bitcoin.script.signature
	// 	// 	.encode(keys.sign(new buffer.Buffer(tosign, "hex")), SIGNHASH_ALL)
	// 	// 	.toString("hex");
	// console.log(tmptx);
	const p2wpkh = bitcoin.payments.p2wpkh({
		pubkey: keyPair.publicKey,
		network: TESTNET,
	});

	const result = await axios
		.get(`${testnetURL}/txs/${rawTx.tx.inputs[0].prev_hash}?token=${token}`)
		.catch((err: any) => {
			console.log(err);
			return res.status(500).send({
				success: false,
				err: err,
			});
		});
	const prev = result.data.outputs;
	console.log(Buffer.from(prev[0].script, "hex"));
	// console.log(prev);
	// console.log(rawTx.tx.outputs[0]);
	const psbt = new bitcoin.Psbt({ network: TESTNET })
		.addInput({
			hash: rawTx.tx.hash,
			index: rawTx.tx.inputs[0].output_index,
			witnessUtxo: {
				script: Buffer.from(prev[0].script, "hex"),
				value: rawTx.tx.inputs[0].output_value,
			},
			// nonWitnessUtxo: Buffer.from(rawTx.tosign, "hex"),
			// redeemScript: p2wpkh.output,
		})
		.addOutput({
			address: rawTx.tx.outputs[0].addresses[0],
			value: rawTx.tx.outputs[0].value,
		})
		.addOutput({
			address: rawTx.tx.outputs[1].addresses[0],
			value: rawTx.tx.outputs[1].value,
		})
		.signInput(0, keyPair);

	// console.log(psbt.data.inputs[0].partialSig[0].signature);
	// console.log(Buffer.from(psbt.data.inputs[0].partialSig[0].signature, "hex"));
	// console.log(psbt.data.inputs[0].partialSig[0].pubkey);
	// console.log(Buffer.from(psbt.data.inputs[0].partialSig[0].pubkey, "hex"));
	// psbt.signInput(0, keyPair);
	const validator = (
		pubkey: Buffer,
		msghash: Buffer,
		signature: Buffer
	): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);
	psbt.validateSignaturesOfInput(0, validator);
	psbt.finalizeAllInputs();
	const tx = psbt.extractTransaction();

	console.log("Transaction hexadecimal:");
	console.log(tx.getId());
	const newtx = psbt.extractTransaction().toHex();
	const result1 = await axios
		.post(`${testnetURL}/txs/push?token=${token}`, {
			tx: newtx,
		})
		.catch((err: any) => {
			console.log(err);
			return res.status(500).send({
				success: false,
				err: err,
			});
		});
	// const result2 = await axios
	// 	.post(`${testnetURL}/txs/send?token=${token}`, {
	// 		tx: rawTx.tx,
	// 		tosign: rawTx.tosign,
	// 		signatures: [
	// 			Buffer.from(psbt.data.inputs[0].partialSig[0].signature, "hex"),
	// 		],
	// 		pubkeys: [Buffer.from(psbt.data.inputs[0].partialSig[0].pubkey, "hex")],
	// 	})
	// 	.catch((err: any) => {
	// 		console.log(err);
	// 		return res.status(500).send({
	// 			success: false,
	// 			err: err,
	// 		});
	// 	});
	res.status(201).send({
		success: true,
		message: "정상적으로 처리되었습니다.",
		// data: {
		// 	result1,
		// 	// signature: tmptx.signatures,
		// 	// pubkeys: tmptx.pubkeys,
		// },
	});
};
// const signTransaction = async (req: Request, res: Response) => {
// 	const { privateKey, rawTx } = req.body;
// 	const ECPair = ECPairFactory(ecc);
// 	const keyPair = ECPair.fromWIF(
// 		"L1mnYqaXhGXdXNNnRT7qs6RxfuU9t6U6gXzB7zcz1zMy78aye7BC",
// 		TESTNET
// 	);
// 	const sighashType = 1;

// 	// const txHex = rawTx.transaction.hash;
// 	// Read the transaction
// 	// var tx = bitcoin.Transaction(txHex);
// 	// Load the private key
// 	// var keyPair = bitcoin.ECPair.fromWIF(privateKey);
// 	console.log({ keyPair });
// 	console.log(bitcoin.script.signature);
// 	// console.log(bitcoin.signature);
// 	// console.log(bitcoin.bscript);
// 	var signature = bitcoinMessage.sign(
// 		rawTx.tosign,
// 		keyPair.privateKey,
// 		keyPair.compressed,
// 		{
// 			segwitType: "p2wpkh",
// 		}
// 	);
// 	console.log(signature.toString("base64"));

// 	// const signature = bitcoin.script.signature.encode(
// 	// 	keyPair.sign(rawTx.transaction.hash),
// 	// 	sighashType
// 	// );
// 	console.log(signature);
// 	// ----------------------
// 	// Build the transaction:
// 	// ----------------------
// 	// var txb = new bitcoin.Transaction();
// 	// Add the inputs
// 	// console.log({ tx });
// 	// tx.ins.forEach(function (value: any, index: any) {
// 	// 	txb.addInput(value.hash, value.index);
// 	// 	txb.sign(index, keyPair);
// 	// });
// 	// // Add the outputs
// 	// tx.outs.forEach(function (value: any, index: any) {
// 	// 	txb.tx.outs.push(value);
// 	// });
// 	// const result = txb.build().toHex();
// 	// console.log(result);
// 	// let pubkeys = [];
// 	// let keys = new bitcoin.ECPair.fromWIF(privateKey, TESTNET);
// 	// let signatures = tosign.map(function (tosign: any, n: any) {
// 	// 	pubkeys.push(keys.publicKey.toString("hex"));
// 	// });
// 	// const SIGNHASH_ALL = 0x01;
// 	// const result = bitcoin.script.signature
// 	// 	.encode(keys.sign(new buffer.Buffer(tosign, "hex")), SIGNHASH_ALL)
// 	// 	.toString("hex");
// 	// console.log({ result });
// 	// const createPayment = (_type: string, myKeys?: any[], network?: any): any => {
// 	// 	network = TESTNET;
// 	// 	const splitType = _type.split("-").reverse();
// 	// 	const keys = myKeys || [];

// 	// 	let payment = {
// 	// 		pubkey: keys[0].publicKey,
// 	// 		TESTNET,
// 	// 	};
// 	// 	return {
// 	// 		payment,
// 	// 		keys,
// 	// 	};
// 	// };
// 	// const psbt = new bitcoin.Psbt({ network: TESTNET });
// 	// psbt.signInput(0, bitcoin.ECPair.fromWIF(privateKey, TESTNET));
// 	// psbt.validateSignaturesOfAllInputs();
// 	// psbt.finalizeAllInputs();

// 	// const transaction = psbt.extractTransaction();
// 	// const signedTransaction = transaction.toHex();
// 	// const transactionId = transaction.getId();

// 	res.status(201).send({
// 		success: true,
// 		message: "정상적으로 처리되었습니다.",
// 		data: {
// 			tx: rawTx.tx,
// 			tosign: [rawTx.tosign],
// 			signature: [signature.toString("hex")],
// 			pubkeys: [keyPair.publicKey.toString("hex")],
// 		},
// 	});
// };

// function createPayment(_type: string, myKeys?: any[], network?: any): any {
// 	network = network || TESTNET;
// 	const splitType = _type.split("-").reverse();
// 	const isMultisig = splitType[0].slice(0, 4) === "p2ms";
// 	const keys = myKeys || [];
// 	let m: number | undefined;
// 	if (isMultisig) {
// 		const match = splitType[0].match(/^p2ms\((\d+) of (\d+)\)$/);
// 		m = parseInt(match![1], 10);
// 		let n = parseInt(match![2], 10);
// 		if (keys.length > 0 && keys.length !== n) {
// 			throw new Error("Need n keys for multisig");
// 		}
// 		while (!myKeys && n > 1) {
// 			keys.push(ECPair.makeRandom({ network }));
// 			n--;
// 		}
// 	}
// 	if (!myKeys) keys.push(ECPair.makeRandom({ network }));

// 	let payment: any;
// 	splitType.forEach((type) => {
// 		if (type.slice(0, 4) === "p2ms") {
// 			payment = bitcoin.payments.p2ms({
// 				m,
// 				pubkeys: keys.map((key) => key.publicKey).sort((a, b) => a.compare(b)),
// 				network,
// 			});
// 		} else if (["p2sh", "p2wsh"].indexOf(type) > -1) {
// 			payment = (bitcoin.payments as any)[type]({
// 				redeem: payment,
// 				network,
// 			});
// 		} else {
// 			payment = (bitcoin.payments as any)[type]({
// 				pubkey: keys[0].publicKey,
// 				network,
// 			});
// 		}
// 	});
// 	return {
// 		payment,
// 		keys,
// 	};
// }

// async function getInputData(
// 	amount: number,
// 	payment: any,
// 	isSegwit: boolean,
// 	redeemType: string
// ): Promise<any> {
// 	const unspent = await regtestUtils.faucetComplex(payment.output, amount);
// 	const utx = await regtestUtils.fetch(unspent.txId);
// 	// for non segwit inputs, you must pass the full transaction buffer
// 	const nonWitnessUtxo = Buffer.from(utx.txHex, "hex");
// 	// for segwit inputs, you only need the output script and value as an object.
// 	const witnessUtxo = getWitnessUtxo(utx.outs[unspent.vout]);
// 	const mixin = isSegwit ? { witnessUtxo } : { nonWitnessUtxo };
// 	const mixin2: any = {};
// 	switch (redeemType) {
// 		case "p2sh":
// 			mixin2.redeemScript = payment.redeem.output;
// 			break;
// 		case "p2wsh":
// 			mixin2.witnessScript = payment.redeem.output;
// 			break;
// 		case "p2sh-p2wsh":
// 			mixin2.witnessScript = payment.redeem.redeem.output;
// 			mixin2.redeemScript = payment.redeem.output;
// 			break;
// 	}
// 	return {
// 		hash: unspent.txId,
// 		index: unspent.vout,
// 		...mixin,
// 		...mixin2,
// 	};
// }

export { createTransaction, signTransaction, sendTransaction };
