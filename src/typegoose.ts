import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import * as data from "./data";

export * from './method';
export * from './prop';
export * from './hooks';
export * from './plugin';
export {getClassForDocument} from './utils';

export type InstanceType<T> = T & mongoose.Document;
export type ModelType<T> = mongoose.Model<InstanceType<T>> & T;

export interface GetModelForClassOptions {
	existingMongoose?: mongoose.Mongoose;
	schemaOptions?: mongoose.SchemaOptions;
	existingConnection?: mongoose.Connection;
}

export class Typegoose {
	getModelForClass<T>(t: T, {existingMongoose, schemaOptions, existingConnection}: GetModelForClassOptions = {}) {
		const name = this.constructor.name;
		if (!data.models[name]) {
			this.setModelForClass(t, {existingMongoose, schemaOptions, existingConnection});
		}

		return data.models[name] as ModelType<this> & T;
	}

	setModelForClass<T>(t: T, {existingMongoose, schemaOptions, existingConnection}: GetModelForClassOptions = {}) {
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

		if (existingConnection)
			data.models[name] = existingConnection.model(name, sch);
		else if (existingMongoose)
			data.models[name] = existingMongoose.model(name, sch);
		else
			data.models[name] = mongoose.model(name, sch);

		data.constructors[name] = this.constructor;

		return data.models[name] as ModelType<this> & T;
	}

	private buildSchema(name: string, schemaOptions, sch?: mongoose.Schema) {
		const Schema = mongoose.Schema;

		if (!sch) {
			sch = schemaOptions ?
				new Schema(data.schema[name], schemaOptions) :
				new Schema(data.schema[name]);
		} else {
			sch.add(data.schema[name]);
		}

		const staticMethods = data.methods.staticMethods[name];
		if (staticMethods) {
			sch.statics = Object.assign(staticMethods, sch.statics || {});
		} else {
			sch.statics = sch.statics || {};
		}

		const instanceMethods = data.methods.instanceMethods[name];
		if (instanceMethods) {
			sch.methods = Object.assign(instanceMethods, sch.methods || {});
		} else {
			sch.methods = sch.methods || {};
		}

		if (data.hooks[name]) {
			const preHooks = data.hooks[name].pre;
			preHooks.forEach((preHookArgs) => {
				if (preHookArgs[0] === "augmentedFindOneAndUpdate") {
					<any>sch.pre("findOneAndUpdate", function (next) {
						preHookArgs[1](next, this.getQuery, this.getUpdate());
					})
				} else
					(sch as any).pre(...preHookArgs);
			});
			const postHooks = data.hooks[name].post;
			postHooks.forEach((postHookArgs) => {
				(sch as any).post(...postHookArgs);
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
