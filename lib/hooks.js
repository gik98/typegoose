"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = require("./data");
const hooks = {
    pre(...args) {
        return (constructor) => {
            addToHooks(constructor.name, 'pre', args);
        };
    },
    post(...args) {
        return (constructor) => {
            addToHooks(constructor.name, 'post', args);
        };
    },
};
const addToHooks = (name, hookType, args) => {
    if (!data.hooks[name]) {
        data.hooks[name] = { pre: [], post: [] };
    }
    data.hooks[name][hookType].push(args);
};
exports.pre = hooks.pre;
exports.post = hooks.post;
//# sourceMappingURL=hooks.js.map