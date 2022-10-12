require("dotenv").config()
import { Request, Response } from "express"
import Web3 from "web3"

const getChainInfo = async (req: Request, res: Response) => {
	//set environment variables
	const currentChain = process.env.CurrentChain || ""
	const SepoliaTestnet: string = process.env.SepoliaTestnet || ""
	const GoerliTestnet: string = process.env.GoerliTestnet || ""
	const EthMainnet: string = process.env.EthMainnet || ""
	const provider =
		process.env.ethCurrentChain === "sepolia"
			? SepoliaTestnet
			: process.env.ethCurrentChain === "goerli"
			? GoerliTestnet
			: process.env.ethCurrentChain == "mainnet"
			? EthMainnet
			: SepoliaTestnet
	const web3 = new Web3(new Web3.providers.HttpProvider(provider))

	//get chain Id and chainName
	try {
		const chainId = await web3.eth.getChainId()
		res.status(200).send({
			success: true,
			message: "정상적으로 처리되었습니다.",
			data: {
				chainId: chainId,
				chainName: currentChain,
			},
		})
	} catch (e) {
		res.status(500).send({
			success: false,
			message: e,
		})
	}
}

export { getChainInfo }
