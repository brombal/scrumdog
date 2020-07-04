import * as React from "react";
import { useContext, useEffect, useRef } from "react";

type EventCallback = (...args: any[]) => void;

export type EventEmitter = (event: string, ...args: any[]) => void;

export class EventContext {
  private listeners: { [key: string]: Set<EventCallback> } = {};

  emit = (event: string, ...args: any[]): void => {
    console.log("event emitted", event, args);
    this.listeners[event]?.forEach((l) => l(...args));
  };

  on = (event: string, callback: EventCallback): (() => void) => {
    console.log("event subscribed", event, callback);
    this.listeners[event] = this.listeners[event] || new Set();
    this.listeners[event].add(callback);
    return () => this.off(event, callback);
  };

  off = (event: string, callback: EventCallback): void => {
    console.log("event unsubscribed", event, callback);
    this.listeners[event]?.delete(callback);
  };
}

const eventContext = React.createContext<EventContext>(new EventContext());

type EventProviderProps = {
  value?: EventContext;
  children: any;
};

export function EventProvider(props: EventProviderProps): React.ReactElement {
  const eventEmitter = useRef(props.value || new EventContext());
  return <eventContext.Provider value={eventEmitter.current}>{props.children}</eventContext.Provider>;
}

export function useEvent(event: string, callback: EventCallback, deps: any[] = []): void {
  const ctx = useContext(eventContext);

  useEffect(() => {
    return ctx.on(event, callback);
  }, deps);
}

export function useEventEmitter(): EventEmitter {
  const ctx = useContext(eventContext);
  return ctx.emit;
}
