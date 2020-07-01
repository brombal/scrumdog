import clone from "./clone";
import compare from "./compare";

/**
 * Calls `changer`, passing in a draft copy of `object`.
 * If no changes are made, `object` is returned.
 * If `changer` mutates the draft copy, the draft copy is returned but changes are applied
 * so that equivalent properties remain identical (===), but changed properties do not.
 */
export default function applyChanges<T>(object: T, changer: (draft: T) => any): T {
  const draft = clone(object);
  changer(draft);
  return compare(object, draft);
}
