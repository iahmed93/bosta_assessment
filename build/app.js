"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var mongoose_1 = require("mongoose");
var user_route_1 = __importDefault(require("./user.route"));
var dotenv = __importStar(require("dotenv"));
dotenv.config();
// rest of the code remains same
var app = (0, express_1.default)();
var PORT = process.env.SERVER_PORT;
app.use("/user", user_route_1.default);
var url = process.env.DB_URL;
var connectionOptions = {};
(0, mongoose_1.connect)(url, connectionOptions)
    .then(function () { return console.log("[server]: Connected to database"); })
    .catch(function (err) { return console.log(err); });
app.listen(PORT, function () {
    console.log("[server]: Server is running at https://localhost:" + PORT);
});
