import * as data from './data';

type MethodType = 'instanceMethods' | 'staticMethods';

const baseMethod = (target: any, key: string, descriptor: TypedPropertyDescriptor<any>, methodType: MethodType) => {
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key);
  }

  let name;
  if (methodType === 'instanceMethods') {
    name = target.constructor.name;
  }
  if (methodType === 'staticMethods') {
    name = target.name;
  }

  if (!data.methods[methodType][name]) {
    data.methods[methodType][name] = {};
  }

  const method = descriptor.value;
  data.methods[methodType][name] = {
    ...data.methods[methodType][name],
    [key]: method,
  };
};

export const staticMethod = (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) =>
  baseMethod(target, key, descriptor, 'staticMethods');

export const instanceMethod = (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) =>
  baseMethod(target, key, descriptor, 'instanceMethods');
