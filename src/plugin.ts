import * as data from './data';

export const plugin = (mongoosePlugin, options?) => (constructor: any) => {
  const name = constructor.name;
  if (!data.plugins[name]) {
    data.plugins[name] = [];
  }
  data.plugins[name].push({ mongoosePlugin, options });
};
