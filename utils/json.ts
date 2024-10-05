export const serialize = <T,>(data: T) => {
  // eslint-disable-next-line unicorn/prefer-structured-clone
  return JSON.parse(JSON.stringify(data)) as T;
};
