require("dotenv").config();
import { Request, Response } from "express";
import Web3 from "web3";

const getChainInfo = async (req: Request, res: Response) => {
	const currentChain = process.env.CurrentChain || "";
	const SepoliaTestnet: string = process.env.SepoliaTestnet || "";
	const GoerliTestnet: string = process.env.GoerliTestnet || "";
	const provider =
		process.env.CurrentChain === "sepolia"
			? SepoliaTestnet
			: process.env.CurrentChain === "goerli"
			? GoerliTestnet
			: SepoliaTestnet;
	const web3 = new Web3(new Web3.providers.HttpProvider(provider));
	// console.log(web3);

	try {
		const chainId = await web3.eth.getChainId();
		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: {
				chainId: chainId,
				chainName: currentChain,
			},
		});
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		});
	}
};

export { getChainInfo };
