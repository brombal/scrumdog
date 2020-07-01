export function tryJsonParse(str: string, def: any = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return def;
  }
}

export function toggleEntry<T>(
  arr: T[],
  entry: T,
  toggle?: boolean,
  compare?: (arrValue: T, entry: T, i: number, arr: T[]) => boolean
): T[] {
  if (!arr) return arr;

  compare = compare || ((arrValue: T, entry: T, i: number, arr: T[]) => arrValue === entry);
  const findIndex = () => arr.findIndex((arrValue, i) => compare(arrValue, entry, i, arr));
  const includes = findIndex() !== -1;
  toggle = toggle ?? !includes;

  if (toggle) {
    if (!includes) {
      arr.push(entry);
    }
  } else {
    let i: number;
    do {
      i = findIndex();
      if (i !== -1) arr.splice(i, 1);
    } while (i !== -1);
  }

  return arr;
}

export function cleanObject<T extends object>(object: T): T {
  for (const key in object) {
    if (object[key] === undefined)
      delete object[key];
  }
  return object;
}

export function delay(seconds: number): Promise<void> {
  return new Promise(accept => setTimeout(() => accept(), seconds * 1000));
}
