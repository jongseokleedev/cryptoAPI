import express, { Router } from "express"

import btcRouter from "./btcRouter"
import ethRouter from "./ethRouter"

const router: Router = express.Router()

router.use("/btc", btcRouter)
router.use("/eth", ethRouter)

export default router
