"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = require("./data");
exports.plugin = (mongoosePlugin, options) => (constructor) => {
    const name = constructor.name;
    if (!data.plugins[name]) {
        data.plugins[name] = [];
    }
    data.plugins[name].push({ mongoosePlugin, options });
};
//# sourceMappingURL=plugin.js.map