import * as mongoose from 'mongoose';
import {SchemaType} from 'mongoose';
import * as _ from 'lodash';

import * as data from "./data"
import {initAsArray, initAsObject, isDate, isMongoose, isNumber, isPrimitive, isString} from './utils';
import {InvalidPropError, NoMetadataError, NotDateTypeError, NotNumberTypeError, NotStringTypeError} from './errors';

export type Func = (...args: any[]) => any;

export type RequiredType = boolean | [boolean, string] | string | Func | [Func, string];

export interface SyncValidationOption {
	validator: (v: any) => boolean
}

export interface PromiseValidationOption {
	validator: (v: any) => Promise<boolean>;
}

export interface BasePropOptions {
	required?: RequiredType;
	enum?: string[] | object;
	default?: any;
	unique?: boolean;
	index?: boolean;
	sparse?: boolean;
	expires?: string | number;
	get?: (val: any, schemaType?: SchemaType) => any;
	set?: (val: any, schemaType?: SchemaType) => any;
	validate?: RegExp | [RegExp, string] | SyncValidationOption | PromiseValidationOption;
}

export interface PropOptions extends BasePropOptions {
	ref?: any;
}

export interface ValidateNumberOptions {
	min?: number | [number, string];
	max?: number | [number, string];
}

export interface ValidateStringOptions {
	minlength?: number | [number, string];
	maxlength?: number | [number, string];
	match?: RegExp | [RegExp, string];
}

export interface TTLOptions {
	expires?: Number | String;
}

export type PropOptionsWithNumberValidate = PropOptions & ValidateNumberOptions;
export type PropOptionsWithStringValidate = PropOptions & ValidateStringOptions;
export type PropOptionsWithTTLOptions = PropOptions & TTLOptions;
export type PropOptionsWithValidate =
	PropOptionsWithNumberValidate
	| PropOptionsWithStringValidate
	| PropOptionsWithTTLOptions;

const isWithStringValidate = (options: PropOptionsWithStringValidate) =>
	(options.minlength || options.maxlength || options.match);

const isWithNumberValidate = (options: PropOptionsWithNumberValidate) =>
	(options.min || options.max);

const isWithTTLOptions = (options: PropOptionsWithTTLOptions) => (!!options.expires);

const baseProp = (rawOptions, Type, target, key, isArray = false) => {
	const name = target.constructor.name;
	const isGetterSetter = Object.getOwnPropertyDescriptor(target, key);
	if (isGetterSetter) {
		if (isGetterSetter.get) {
			if (!data.virtuals[name]) {
				data.virtuals[name] = {};
			}
			if (!data.virtuals[name][key]) {
				data.virtuals[name][key] = {};
			}
			data.virtuals[name][key] = {
				...data.virtuals[name][key],
				get: isGetterSetter.get,
			};
		}

		if (isGetterSetter.set) {
			if (!data.virtuals[name]) {
				data.virtuals[name] = {};
			}
			if (!data.virtuals[name][key]) {
				data.virtuals[name][key] = {};
			}
			data.virtuals[name][key] = {
				...data.virtuals[name][key],
				set: isGetterSetter.set,
			};
		}
		return;
	}

	if (isArray) {
		initAsArray(name, key);
	} else {
		initAsObject(name, key);
	}

	const ref = rawOptions.ref;
	if (ref) {
		data.schema[name][key] = {
			...data.schema[name][key],
			type: mongoose.Schema.Types.ObjectId,
			ref: ref.name,
		};
		return;
	}

	const itemsRef = rawOptions.itemsRef;
	if (itemsRef) {
		data.schema[name][key][0] = {
			...data.schema[name][key][0],
			type: mongoose.Schema.Types.ObjectId,
			ref: itemsRef.name,
		};
		return;
	}

	const enumOption = rawOptions.enum;
	if (enumOption) {
		if (!Array.isArray(enumOption)) {
			rawOptions.enum = Object.keys(enumOption).map((propKey) => enumOption[propKey]);
		}
	}

	// check for validation inconsistencies
	if (isWithStringValidate(rawOptions) && !isString(Type)) {
		throw new NotStringTypeError(key);
	}

	if (isWithNumberValidate(rawOptions) && !isNumber(Type)) {
		throw new NotNumberTypeError(key);
	}

	if (isWithTTLOptions(rawOptions) && !isDate(Type)) {
		throw new NotDateTypeError(key);
	}

	const instance = new Type();
	const subSchema = data.schema[instance.constructor.name];
	if (!subSchema && !(isPrimitive(Type) || isMongoose(Type))) {
		throw new InvalidPropError(Type.name, key);
	}

	const options = _.omit(rawOptions, ['ref', 'items']);
	if (isPrimitive(Type) || isMongoose(Type)) {
		if (isArray) {
			data.schema[name][key][0] = {
				...data.schema[name][key][0],
				...options,
				type: Type,
			};
			return;
		}
		data.schema[name][key] = {
			...data.schema[name][key],
			...options,
			type: Type,
		};
		return;
	}

	if (isArray) {
		data.schema[name][key][0] = {
			...data.schema[name][key][0],
			...options,
			...subSchema,
		};
		return;
	}
	data.schema[name][key] = {
		...data.schema[name][key],
		...options,
		...subSchema,
	};
	return;
};

export const prop = (options: PropOptionsWithValidate = {}) => (target: any, key: string) => {
	const Type = (Reflect as any).getMetadata('design:type', target, key);

	if (!Type) {
		throw new NoMetadataError(key);
	}

	baseProp(options, Type, target, key);
};

export interface ArrayPropOptions extends BasePropOptions {
	items?: any;
	itemsRef?: any;
}

export const arrayProp = (options: ArrayPropOptions) => (target: any, key: string) => {
	const Type = options.items;
	baseProp(options, Type, target, key, true);
};

export type Ref<T> = T | string;
