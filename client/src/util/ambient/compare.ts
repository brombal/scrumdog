import clone from "./clone";

/**
 * Compares a and b for differences.
 * If a and b are identical (===) or equivalent (recursive deep object/array comparison), a is returned.
 * If any properties of a and b are different, `b` is returned. However, all properties of `b` will be compared against
 * `a` using this method.
 */

export default function compare(a: any, b: any): any {
  if (a === b) return a;
  if (typeof a !== typeof b) return clone(b);
  if (!b || !a) return clone(b);
  if (typeof a === "object") {
    let changed = false;
    const result = Array.isArray(a) ? [] : {};
    for (const key in b) {
      const compared = compare(a[key], b[key]);
      if (compared !== a[key]) {
        result[key] = compared;
        changed = true;
      } else {
        result[key] = a[key];
      }
    }
    for (const key in a) {
      if (!(key in b)) changed = true;
    }
    return changed ? result : a;
  } else {
    return clone(b);
  }
}
