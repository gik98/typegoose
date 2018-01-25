import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import * as data from "./data"

export const isPrimitive = (Type) => _.includes(['String', 'Number', 'Boolean', 'Date', 'SchemaBuffer'], Type.name);

export const isMongoose = (Type) => _.includes(['Mixed', 'Embedded'], Type.name);

export const isNumber = (Type) => Type.name === 'Number';

export const isString = (Type) => Type.name === 'String';

export const initAsObject = (name, key) => {
  if (!data.schema[name]) {
    data.schema[name] = {};
  }
  if (!data.schema[name][key]) {
    data.schema[name][key] = {};
  }
};

export const initAsArray = (name, key) => {
  if (!data.schema[name]) {
    data.schema[name] = {};
  }
  if (!data.schema[name][key]) {
    data.schema[name][key] = [{}];
  }
};

export const getClassForDocument = (document: mongoose.Document): any => {
  const modelName = (document.constructor as mongoose.Model<typeof document>).modelName;
  return data.constructors[modelName];
};
