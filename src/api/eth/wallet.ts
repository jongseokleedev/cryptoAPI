require("dotenv").config();
import { Request, Response } from "express";
import Web3 from "web3";
import lightwallet from "eth-lightwallet";
const SepoliaTestnet: string = process.env.SepoliaTestnet || "";
const web3 = new Web3(new Web3.providers.HttpProvider(SepoliaTestnet));
const { toWei, fromWei } = web3.utils;

const newMnemonic = async (req: Request, res: Response) => {
	let mnemonic;
	try {
		mnemonic = lightwallet.keystore.generateRandomSeed();
		res.json({ mnemonic });
	} catch (err) {
		console.log(err);
	}
};

const newWallet = async (req: Request, res: Response) => {
	let password = req.body.password;
	let mnemonic = req.body.mnemonic;
	try {
		//Create Keystore
		lightwallet.keystore.createVault(
			{
				password: password,
				seedPhrase: mnemonic,
				hdPathString: "m/0'/0'/0'",
			},
			//callback Function
			function (err: Error, ks: any) {
				console.log(typeof err, typeof ks);
				ks.keyFromPassword(password, function (err: Error, pwDerivedKey: any) {
					ks.generateNewAddress(pwDerivedKey, 1);

					let address = ks.getAddresses().toString();
					// let keystore = ks.serialize();
					let privateKey = ks.exportPrivateKey(address, pwDerivedKey);

					res.json({ privateKey: privateKey, address: address });
				});
			}
		);
	} catch (exception) {
		console.log("NewWallet ==>>>> " + exception);
	}
};

const balanceOf = async (req: Request, res: Response) => {
	const { address } = req.params;
	const balance = await web3.eth.getBalance(address);
	res.status(200).send({
		message: "success",
		ethBalance: fromWei(balance),
	});
};

export { newMnemonic, newWallet, balanceOf };
// export { newWallet };
// export default { newMnemonic, newWallet };
