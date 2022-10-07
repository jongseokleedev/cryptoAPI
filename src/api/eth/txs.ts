require("dotenv").config();
import { Request, Response } from "express";
import Web3 from "web3";

const SepoliaTestnet: string = process.env.SepoliaTestnet || "";
const provider =
	process.env.CurrentTestnet === "sepolia" ? SepoliaTestnet : SepoliaTestnet;
const web3 = new Web3(new Web3.providers.HttpProvider(provider));
const { toWei, fromWei } = web3.utils;

const createTransaction = async (req: Request, res: Response) => {
	const { from, to, value } = req.body;

	const nonce = await web3.eth.getTransactionCount(from);
	const networkId = await web3.eth.net.getId();
	const gasPrice = await web3.eth.getGasPrice();
	const tx = {
		from: from,
		to: to,
		value: toWei(value.toString()),
		nonce: nonce,
		gasPrice: await web3.eth.getGasPrice(),
		gasLimit: await web3.eth.estimateGas({
			from: from,
			nonce: nonce,
			to: to,
		}),
	};

	res.status(200).send({
		success: true,
		message: "정상적으로 처리되었습니다",
		data: tx,
	});
};

const signTransaction = async (req: Request, res: Response) => {
	const { tx, privateKey } = req.body;
	const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

	res.status(200).send({
		success: true,
		message: "정상적으로 처리되었습니다",
		data: signedTx.rawTransaction,
	});
};

const sendTransaction = async (req: Request, res: Response) => {
	const { signedTx } = req.body;
	const receipt = await web3.eth.sendSignedTransaction(signedTx, (err) => {
		if (err) {
			return res.status(400).send({ error: err });
		}
	});
	res.status(200).send({
		success: true,
		message: "정상적으로 처리되었습니다",
		data: receipt,
	});
};

const getTransaction = async (req: Request, res: Response) => {
	const { txHash } = req.params;
	console.log(web3.currentProvider);
	if (process.env.CurrentTestnet === "sepolia") {
		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다",
			data: { etherScanUrl: `https://sepolia.etherscan.io/tx/${txHash}` },
		});
	} else {
		res.status(500).send({
			success: false,
			message: "invalid testnet",
		});
	}
};

export { createTransaction, signTransaction, sendTransaction, getTransaction };
