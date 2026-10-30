import React, { createContext, useContext, useState, useEffect } from 'react';
import { scenarioManager, ScenarioConfig } from '@/mocks/scenarios';
import { mockDb } from '@/mocks/db';
import { mockSocketServer } from '@/mocks/socket-server';
import { queryClient } from '@/lib/query-client';

interface DevContextType {
  config: ScenarioConfig;
  updateConfig: (partial: Partial<ScenarioConfig>) => void;
  resetDb: () => void;
  triggerPriceShift: (nftId?: string) => void;
  triggerOrderUpdate: (orderId: string, status: 'confirmed' | 'rejected') => void;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export const DevProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ScenarioConfig>(scenarioManager.getConfig());

  useEffect(() => {
    return scenarioManager.subscribe((newCfg) => setConfig({ ...newCfg }));
  }, []);

  const updateConfig = (partial: Partial<ScenarioConfig>) => {
    scenarioManager.update(partial);
  };

  const resetDb = () => {
    mockDb.reset();
    scenarioManager.reset();
    queryClient.clear();
    window.location.reload();
  };

  const triggerPriceShift = (nftId = 'nft-1') => {
    const nft = mockDb.findNftById(nftId);
    if (!nft) return;
    const oldPrice = parseFloat(nft.priceEth);
    const newPrice = (oldPrice + 0.5).toFixed(4);

    mockSocketServer.emit('nft.updated', {
      id: nft.id,
      priceEth: newPrice,
      availableEditions: Math.max(1, nft.availableEditions - 1),
      version: (nft.version || 1) + 1,
      timestamp: new Date().toISOString(),
    });

    queryClient.invalidateQueries({ queryKey: ['nfts'] });
    queryClient.invalidateQueries({ queryKey: ['nft', nftId] });
  };

  const triggerOrderUpdate = (orderId: string, status: 'confirmed' | 'rejected') => {
    mockSocketServer.emit('order.updated', {
      orderId,
      status,
      txHash: status === 'confirmed' ? '0x' + Array.from({ length: 64 }, () => 'f').join('') : undefined,
      version: 2,
      timestamp: new Date().toISOString(),
      errorMessage: status === 'rejected' ? 'Transação recusada pela rede' : undefined,
    });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  };

  return (
    <DevContext.Provider
      value={{
        config,
        updateConfig,
        resetDb,
        triggerPriceShift,
        triggerOrderUpdate,
      }}
    >
      {children}
    </DevContext.Provider>
  );
};

export function useDev() {
  const ctx = useContext(DevContext);
  if (!ctx) throw new Error('useDev deve ser utilizado dentro de DevProvider');
  return ctx;
}
