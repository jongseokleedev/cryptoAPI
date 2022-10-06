require("dotenv").config();
import { Request, Response } from "express";
import Web3 from "web3";

const abi = require("../../contracts/ERC20abi");
const contractAddress = require("../../contracts/ERC20address");

const SepoliaTestnet: string = process.env.SepoliaTestnet || "";
const web3 = new Web3(new Web3.providers.HttpProvider(SepoliaTestnet));
const { toWei, fromWei } = web3.utils;

const soohoContract = new web3.eth.Contract(abi, contractAddress);

const balanceOfERC20 = async (req: Request, res: Response) => {
	const { address, tokenSymbol } = req.params;
	if (tokenSymbol === "sooho") {
		const balance = await soohoContract.methods.balanceOf(address).call();

		res.status(200).send({
			message: "success",
			soohoBalance: balance / 100, //devided by decimal value. in case of sooho, decimal value is 2
		});
	} else {
		res.status(400).send({
			message: "Bad Request. Unsupported Token Name",
		});
	}
};

const createERC20Transaction = async (req: Request, res: Response) => {
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

export { balanceOfERC20, createERC20Transaction };
