"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const data = require("./data");
exports.isPrimitive = (Type) => _.includes(['String', 'Number', 'Boolean', 'Date', 'SchemaBuffer'], Type.name);
exports.isMongoose = (Type) => _.includes(['Mixed', 'Embedded'], Type.name);
exports.isNumber = (Type) => Type.name === 'Number';
exports.isString = (Type) => Type.name === 'String';
exports.isDate = (Type) => Type.name === 'Date';
exports.initAsObject = (name, key) => {
    if (!data.schema[name]) {
        data.schema[name] = {};
    }
    if (!data.schema[name][key]) {
        data.schema[name][key] = {};
    }
};
exports.initAsArray = (name, key) => {
    if (!data.schema[name]) {
        data.schema[name] = {};
    }
    if (!data.schema[name][key]) {
        data.schema[name][key] = [{}];
    }
};
exports.getClassForDocument = (document) => {
    const modelName = document.constructor.modelName;
    return data.constructors[modelName];
};
//# sourceMappingURL=utils.js.map