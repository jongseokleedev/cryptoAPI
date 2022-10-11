import express, { Request, Response, NextFunction } from "express";
import apiRoute from "./router/index"; // export한 이름과 다르게 import할 수 있다!
import { Error } from "./common/interfaces";
const port = process.env.PORT || 5000;
const app = express(); // express 객체 받아옴
export const domain = require("domain").create();
app.use(express.json());
app.get("/", (req: Request, res: Response, next: NextFunction) => {
	res.send("Hi! This is Crypto API server");
});
domain.on("error", (err: any) => {
	console.log("err" + err);
});

app.use("/api", apiRoute);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
	const err: Error = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	res.status(err.status || 500);
	res.json({
		errors: {
			success: false,
			message: err.message,
		},
	});
});

app.listen(port, () => {
	console.log(`
    #############################################
        🛡️ Server listening on port: ${port} 🛡️
    #############################################    
    `);
}); // 8000번 포트에서 서버 실행

export default app;
