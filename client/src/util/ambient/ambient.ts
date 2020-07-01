import applyChanges from "./applyChanges";
import compare from "./compare";

export type AmbientStateMapper<TState, TReturn> = (state: TState) => TReturn;
export type AmbientStateAction<T> = (state: T, prevState: T) => void;
type Unsubscriber = () => void;

export default class Ambient<State> {
  currentState: State;
  listeners: { map?: AmbientStateMapper<State, any>; action: AmbientStateAction<State> }[] = [];

  constructor(private initialState: State = {} as any) {
    this.currentState = initialState;
    Ambient.freeze(this.currentState);
  }

  get(): State {
    return this.currentState;
  }

  static freeze(o: any): void {
    Object.freeze(o);

    Object.getOwnPropertyNames(o).forEach(function (prop) {
      if (
        Object.prototype.hasOwnProperty.call(o, prop) &&
        o[prop] !== null &&
        (typeof o[prop] === "object" || typeof o[prop] === "function") &&
        !Object.isFrozen(o[prop])
      ) {
        Ambient.freeze(o[prop]);
      }
    });
  }

  private set(nextState: State, quiet: boolean): void {
    const prevState = this.currentState;
    this.currentState = nextState;
    Ambient.freeze(this.currentState);
    if (!quiet) {
      this.listeners.forEach((listener) => {
        const prevMapped = listener.map ? listener.map(prevState) : prevState;
        const nextMapped = listener.map ? listener.map(nextState) : nextState;
        if (compare(prevMapped, nextMapped) !== prevMapped) listener.action(this.currentState, prevState);
      });
    }
  }

  subscribe<TMapReturn>(action: AmbientStateAction<State>, map?: AmbientStateMapper<State, TMapReturn>): Unsubscriber {
    this.listeners.push({ map, action });
    return () => this.unsubscribe(action);
  }

  unsubscribe(action: AmbientStateAction<State>): void {
    this.listeners = this.listeners.filter((fn) => fn.action !== action);
  }

  reset(quiet: boolean): void {
    this.set(this.initialState, quiet);
  }

  update(updater: AmbientStateAction<State>, quiet = false): State {
    const nextState = applyChanges(this.currentState, updater as (any: any) => any);
    if (nextState !== this.currentState) this.set(nextState, quiet);
    return nextState;
  }

  /**
   * Returns a Promise that resolves when `check` returns anything other than undefined. `check` is called any time the
   * state updates and changes according to `map`.
   * @param check The method to call when the state updates. If it returns any value other than undefined, the Promise will resolve.
   * @param map The method that determines if the state has updated. See Ambient#subscribe().
   */
  awaiter<TMapReturn = any>(
    check: AmbientStateMapper<State, any>,
    map?: AmbientStateMapper<State, TMapReturn>
  ): Promise<void> {
    return new Promise((resolve) => {
      this.subscribe((state) => {
        const result = check?.(state);
        if (result !== undefined) resolve(result);
      }, map);
    });
  }
}
