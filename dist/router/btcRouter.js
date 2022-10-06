"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.default.Router();
router.get("/:blogId", btc);
router.get("/like/:blogId", likePost);
exports.default = router;
