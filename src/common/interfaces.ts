export interface Error {
	status?: number
	message?: string
}

export interface ethTx {
	from: string
	to: string
	nonce: number
	gasPrice: string
	gasLimit: number
	data: string
}
