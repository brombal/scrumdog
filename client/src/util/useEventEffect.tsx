import { useEffect } from "react";

type EventCallback = (...args: any[]) => void;

export class EventEmitter {
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

declare global {
  interface Window {
    eventEmitter: EventEmitter;
  }
}

window.eventEmitter = window.eventEmitter || new EventEmitter();

export function useEventEffect(event: string, callback: EventCallback, deps: any[] = []): void {
  useEffect(() => {
    return window.eventEmitter.on(event, callback);
  }, deps);
}
