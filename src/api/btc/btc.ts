import { Request, Response } from "express";
// import * as bcypher from "blockcypher";
const testnet: string = "api.blockcypher.com/v1/btc/test3";

const wallet = async (req: Request, res: Response) => {
	const param = req.params;

	return res.status(200).json({
		status: 200,
		message: "포스팅 조회 성공",
		posting_number: param.blogId,
	});
};

const likePost = async (req: Request, res: Response) => {
	const param = req.params;

	return res.status(200).json({
		status: 200,
		message: "좋아요 성공",
		posting_number: param.blogId,
	});
};

export { wallet };
