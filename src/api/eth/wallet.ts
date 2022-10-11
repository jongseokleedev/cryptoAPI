require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import Web3 from "web3";
import lightwallet from "eth-lightwallet";

import { Error } from "../../common/interfaces";
const domain = require("domain").create();
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
const app = require("../../app");

const newMnemonic = async (req: Request, res: Response) => {
	let mnemonic;
	try {
		mnemonic = lightwallet.keystore.generateRandomSeed();
		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			mnemonic,
		});
	} catch (err) {
		res.status(500).send({
			success: false,
			message: err,
		});
	}
};

const newWallet = async (req: Request, res: Response) => {
	let password = req.body.password;
	let mnemonic = req.body.mnemonic;
	try {
		let mnemonicArray = req.body.mnemonic.split(" ");
		if (mnemonicArray.length !== 12) {
			return res.status(400).send({
				success: false,
				message: "12개 니모닉 코드를 입력해주세요.",
			});
		}
		//Create Keystore
		lightwallet.keystore.createVault(
			{
				password: password,
				seedPhrase: mnemonic,
				hdPathString: "m/0'/0'/0'",
			},
			//callback Function
			function (err: Error, ks: any) {
				if (err) {
					return res.status(400).send({
						success: false,
						message: err,
					});
				}
				ks.keyFromPassword(password, function (err: Error, pwDerivedKey: any) {
					if (err) {
						return res.status(400).send({
							success: false,
							message: err,
						});
					}
					ks.generateNewAddress(pwDerivedKey, 1);

					let address = ks.getAddresses().toString();
					// let keystore = ks.serialize();
					let privateKey = ks.exportPrivateKey(address, pwDerivedKey);

					res.status(200).send({
						success: true,
						message: "정상적으로 처리되었습니다.",
						privateKey: privateKey,
						address: address,
					});
				});
			}
		);
	} catch (exception) {
		console.log("NewWallet ==>>>> " + exception);
		res.status(400).send({
			success: false,
			message: exception,
		});
	}
};

const balanceOf = async (req: Request, res: Response, next: NextFunction) => {
	const { address } = req.params;
	try {
		const isAddress = web3.utils.isAddress(address); // 유효한 이더리움 주소인지 확인
		if (isAddress) {
			const balance = await web3.eth.getBalance(address);

			return res.status(200).send({
				success: true,
				message: "정상적으로 처리되었습니다.",
				ethBalance: fromWei(balance),
			});
		} else {
			return res.status(400).send({
				success: false,
				message: "주소가 올바르지 않습니다.",
			});
		}
	} catch (e) {
		return res.status(500).send({
			success: false,
			message: e,
		});
	}
};
export { newMnemonic, newWallet, balanceOf };
// export { newWallet };
// export default { newMnemonic, newWallet };
