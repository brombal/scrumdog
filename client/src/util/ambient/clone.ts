export default function cloneDeep<T>(value: T): T {
  let clone = value;
  if (clone && typeof value === "object") {
    clone = (Array.isArray(value) ? [] : {}) as T;
    for (const key in value) {
      clone[key] = cloneDeep(value[key]);
    }
  }
  return clone;
}
