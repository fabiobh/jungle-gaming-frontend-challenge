import { NftUpdatedEvent, OrderUpdatedEvent } from '@/types';
import { mockSocketServer } from '@/mocks/socket-server';

type EventHandler<T> = (data: T) => void;

class RealtimeClient {
  private handlers: Map<string, Set<EventHandler<any>>> = new Map();
  private resourceVersions: Map<string, number> = new Map();
  private isConnected: boolean = true;
  private reconnectCallbacks: Set<() => void> = new Set();
  private unregisterMockServer: (() => void) | null = null;

  constructor() {
    this.connect();
  }

  public connect() {
    this.isConnected = true;
    if (!this.unregisterMockServer) {
      this.unregisterMockServer = mockSocketServer.registerClient((event, data) => {
        if (!this.isConnected) return;
        this.handleIncomingEvent(event, data);
      });
    }
  }

  public disconnect() {
    this.isConnected = false;
  }

  public reconnect() {
    this.isConnected = true;
    this.reconnectCallbacks.forEach((cb) => cb());
  }

  public onReconnect(callback: () => void) {
    this.reconnectCallbacks.add(callback);
    return () => this.reconnectCallbacks.delete(callback);
  }

  public on<T = any>(event: string, handler: EventHandler<T>) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  public off<T = any>(event: string, handler: EventHandler<T>) {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  private handleIncomingEvent(event: string, data: any) {
    // 1. Version check and deduplication
    if (event === 'nft.updated') {
      const payload = data as NftUpdatedEvent;
      const key = `nft:${payload.id}`;
      const currentVersion = this.resourceVersions.get(key) || 0;
      if (payload.version <= currentVersion) {
        console.warn(`[Socket.IO] Ignorando evento desatualizado ou duplicado para ${key}: v${payload.version} <= v${currentVersion}`);
        return;
      }
      this.resourceVersions.set(key, payload.version);
    } else if (event === 'order.updated') {
      const payload = data as OrderUpdatedEvent;
      const key = `order:${payload.orderId}`;
      const currentVersion = this.resourceVersions.get(key) || 0;
      if (payload.version <= currentVersion) {
        console.warn(`[Socket.IO] Ignorando evento desatualizado ou duplicado para ${key}: v${payload.version} <= v${currentVersion}`);
        return;
      }
      this.resourceVersions.set(key, payload.version);
    }

    // 2. Dispatch to registered listeners
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (e) {
          console.error(`Erro no listener do evento ${event}:`, e);
        }
      });
    }
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

export const socketClient = new RealtimeClient();
