const async = require("./async");
const attr = require("./attr");
const ui = require("./ui");

Object.assign(module.exports, async);
Object.assign(module.exports, attr);
Object.assign(module.exports, ui);

module.exports.VERSION = "__VERSION__";
