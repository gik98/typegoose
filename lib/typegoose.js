"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const mongoose = require("mongoose");
const _ = require("lodash");
const data = require("./data");
__export(require("./method"));
__export(require("./prop"));
__export(require("./hooks"));
__export(require("./plugin"));
var utils_1 = require("./utils");
exports.getClassForDocument = utils_1.getClassForDocument;
class Typegoose {
    getModelForClass(t, { existingMongoose, schemaOptions, existingConnection } = {}) {
        const name = this.constructor.name;
        if (!data.models[name]) {
            this.setModelForClass(t, { existingMongoose, schemaOptions, existingConnection });
        }
        return data.models[name];
    }
    setModelForClass(t, { existingMongoose, schemaOptions, existingConnection } = {}) {
        const name = this.constructor.name;
        // get schema of current model
        let sch = this.buildSchema(name, schemaOptions);
        // get parents class name
        let parentCtor = Object.getPrototypeOf(this.constructor.prototype).constructor;
        // iterate trough all parents
        while (parentCtor && parentCtor.name !== 'Typegoose' && parentCtor.name !== 'Object') {
            // extend schema
            sch = this.buildSchema(parentCtor.name, schemaOptions, sch);
            // next parent
            parentCtor = Object.getPrototypeOf(parentCtor.prototype).constructor;
        }
        /*sch.pre("findOneAndUpdate", next => {
          next()
        })*/
        if (existingConnection)
            data.models[name] = existingConnection.model(name, sch);
        else if (existingMongoose)
            data.models[name] = existingMongoose.model(name, sch);
        else
            data.models[name] = mongoose.model(name, sch);
        data.constructors[name] = this.constructor;
        return data.models[name];
    }
    buildSchema(name, schemaOptions, sch) {
        const Schema = mongoose.Schema;
        if (!sch) {
            sch = schemaOptions ?
                new Schema(data.schema[name], schemaOptions) :
                new Schema(data.schema[name]);
        }
        else {
            sch.add(data.schema[name]);
        }
        const staticMethods = data.methods.staticMethods[name];
        if (staticMethods) {
            sch.statics = Object.assign(staticMethods, sch.statics || {});
        }
        else {
            sch.statics = sch.statics || {};
        }
        const instanceMethods = data.methods.instanceMethods[name];
        if (instanceMethods) {
            sch.methods = Object.assign(instanceMethods, sch.methods || {});
        }
        else {
            sch.methods = sch.methods || {};
        }
        /*if (data.hooks[name]) {
          const preHooks = data.hooks[name].pre;
          preHooks.forEach((preHookArgs) => {
            (sch as any).pre(...preHookArgs);
          });
          const postHooks = data.hooks[name].post;
          postHooks.forEach((postHookArgs) => {
            (sch as any).post(...postHookArgs);
          });
        }*/
        if (data.hooks[name]) {
            const preHooks = data.hooks[name].pre;
            preHooks.forEach((preHookArgs) => {
                if (preHookArgs[0] === "augmentedFindOneAndUpdate") {
                    sch.pre("findOneAndUpdate", function (next) {
                        preHookArgs[1](next, this.getUpdate());
                        //let thisClosure = this;
                        //preHookArgs[1].call(thisClosure, next);
                    });
                }
                else
                    sch.pre(...preHookArgs);
            });
            const postHooks = data.hooks[name].post;
            postHooks.forEach((postHookArgs) => {
                sch.post(...postHookArgs);
            });
        }
        if (data.plugins[name]) {
            _.forEach(data.plugins[name], (plugin) => {
                sch.plugin(plugin.mongoosePlugin, plugin.options);
            });
        }
        const getterSetters = data.virtuals[name];
        _.forEach(getterSetters, (value, key) => {
            if (value.get) {
                sch.virtual(key).get(value.get);
            }
            if (value.set) {
                sch.virtual(key).set(value.set);
            }
        });
        return sch;
    }
}
exports.Typegoose = Typegoose;
//# sourceMappingURL=typegoose.js.map