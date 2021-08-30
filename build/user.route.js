"use strict";
var express_1 = require("express");
var userRouter = (0, express_1.Router)();
userRouter.put("/signup", function (req, res) {
    return res.send("Post Sign Up");
});
userRouter.post("/signin", function (req, res) {
    return res.send("Post Sign IN");
});
userRouter.post("/verify", function (req, res) {
    return res.send("Post Sign IN");
});
module.exports = userRouter;
