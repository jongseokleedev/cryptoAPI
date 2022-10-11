require("dotenv").config();
import { Request, Response } from "express";
import Web3 from "web3";
import { ethTx } from "../../common/interfaces";
const SepoliaTestnet: string = process.env.SepoliaTestnet || "";
const GoerliTestnet: string = process.env.GoerliTestnet || "";
const provider =
	process.env.CurrentChain === "sepolia"
		? SepoliaTestnet
		: process.env.CurrentChain === "goerli"
		? GoerliTestnet
		: SepoliaTestnet;
const web3 = new Web3(new Web3.providers.HttpProvider(provider));
const { toWei, fromWei } = web3.utils;

const createTransaction = async (req: Request, res: Response) => {
	const { from, to, value } = req.body;
	const isValidFromAddress = web3.utils.isAddress(from); // 유효한 이더리움 주소인지 확인
	const isValidToAddress = web3.utils.isAddress(to); // 유효한 이더리움 주소인지 확인

	if (!isValidFromAddress || !isValidToAddress) {
		return res.status(400).send({
			success: false,
			message: "유효한 주소를 입력해주세요",
		});
	}
	if (typeof value !== "number") {
		return res.status(400).send({
			success: false,
			message: "유효한 Value를 입력해주세요",
		});
	}
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
function instanceOfEthTx(object: any): object is ethTx {
	return object;
}
const signTransaction = async (req: Request, res: Response) => {
	try {
		const { tx, privateKey } = req.body;
		const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다",
			data: {
				rawTransaction: signedTx.rawTransaction,
			},
		});
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
			// data: signedTx.rawTransaction,
		});
	}
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

	if (process.env.CurrentChain === "sepolia") {
		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다",
			data: { etherScanUrl: `https://sepolia.etherscan.io/tx/${txHash}` },
		});
	} else if (process.env.CurrentChain === "goerli") {
		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다",
			data: { etherScanUrl: `https://goerli.etherscan.io/tx/${txHash}` },
		});
	} else {
		res.status(500).send({
			success: false,
			message: "invalid testnet",
		});
	}
};

export { createTransaction, signTransaction, sendTransaction, getTransaction };
