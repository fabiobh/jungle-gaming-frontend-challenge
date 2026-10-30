import { NftUpdatedEvent, OrderUpdatedEvent } from '@/types';
import { mockDb } from './db';

type SocketEventListener = (event: string, data: any) => void;

class MockSocketServer {
  private listeners: Set<SocketEventListener> = new Set();
  private channel: BroadcastChannel | null = null;
  private connectedClients: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('jungle_socket_io_channel');
      this.channel.onmessage = (msg) => {
        const { event, data } = msg.data || {};
        if (event && data) {
          this.notifyLocal(event, data);
        }
      };
    }
  }

  public registerClient(listener: SocketEventListener) {
    this.listeners.add(listener);
    this.connectedClients++;
    return () => {
      this.listeners.delete(listener);
      this.connectedClients = Math.max(0, this.connectedClients - 1);
    };
  }

  private notifyLocal(event: string, data: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (e) {
        console.error('Error dispatching socket event', e);
      }
    });
  }

  public emit(event: 'nft.updated', data: NftUpdatedEvent): void;
  public emit(event: 'order.updated', data: OrderUpdatedEvent): void;
  public emit(event: string, data: any): void {
    // If updating an NFT, keep DB synchronized
    if (event === 'nft.updated') {
      const payload = data as NftUpdatedEvent;
      mockDb.updateNft(payload.id, {
        priceEth: payload.priceEth,
        availableEditions: payload.availableEditions,
        version: payload.version,
      });
    }

    // Broadcast across browser tabs / windows
    if (this.channel) {
      this.channel.postMessage({ event, data });
    }
    this.notifyLocal(event, data);
  }

  public getConnectedClientsCount() {
    return this.connectedClients;
  }
}

export const mockSocketServer = new MockSocketServer();
