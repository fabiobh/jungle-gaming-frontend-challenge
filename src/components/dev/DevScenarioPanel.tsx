import React, { useState } from 'react';
import { useDev } from '@/context/DevContext';
import { Button } from '@/components/ui/Button';
import { Sliders, RefreshCw, Radio, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

export const DevScenarioPanel: React.FC = () => {
  const { config, updateConfig, resetDb, triggerPriceShift } = useDev();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-xl hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-white"
          title="Abrir painel de cenários de teste"
          data-testid="dev-panel-trigger"
        >
          <Sliders className="h-4 w-4" />
          <span>Mocks & Cenários</span>
        </button>
      ) : (
        <div
          className="w-80 rounded-xl border border-border bg-surface-card p-4 shadow-2xl backdrop-blur-md"
          role="dialog"
          aria-label="Painel de simulação de cenários MSW e Socket.IO"
        >
          <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-text-primary">Simulação de Cenários</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {/* Latência de Rede */}
            <div>
              <label className="block font-medium text-text-secondary mb-1">
                Latência de Rede (ms)
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[0, 500, 2000].map((ms) => (
                  <button
                    key={ms}
                    onClick={() => updateConfig({ latencyMs: ms })}
                    className={`rounded px-2 py-1 text-center font-semibold transition-colors ${
                      config.latencyMs === ms
                        ? 'bg-primary text-white'
                        : 'bg-surface-raised text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {ms === 0 ? '0ms' : `${ms}ms`}
                  </button>
                ))}
              </div>
            </div>

            {/* Simular Erros HTTP */}
            <div>
              <label className="block font-medium text-text-secondary mb-1 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-status-error" /> Forçar Erro HTTP
              </label>
              <select
                value={config.forceHttpError || ''}
                onChange={(e) =>
                  updateConfig({
                    forceHttpError: e.target.value ? parseInt(e.target.value, 10) : null,
                  })
                }
                className="w-full rounded border border-border bg-surface-raised px-2 py-1 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="">Nenhum (Sucesso HTTP 200/201)</option>
                <option value="400">400 Bad Request</option>
                <option value="401">401 Unauthorized</option>
                <option value="403">403 Forbidden</option>
                <option value="404">404 Not Found</option>
                <option value="409">409 Conflict</option>
                <option value="500">500 Internal Server Error</option>
              </select>
            </div>

            {/* Cenário de Pagamento Recusado */}
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-medium text-text-secondary">Simular Recusa no Checkout:</span>
              <input
                type="checkbox"
                checked={config.simulatePaymentFailure}
                onChange={(e) => updateConfig({ simulatePaymentFailure: e.target.checked })}
                className="rounded border-border accent-primary"
              />
            </div>

            {/* Cenário de Sessão Expirada */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-secondary">Simular Sessão Expirada:</span>
              <input
                type="checkbox"
                checked={config.simulateSessionExpired}
                onChange={(e) => updateConfig({ simulateSessionExpired: e.target.checked })}
                className="rounded border-border accent-primary"
              />
            </div>

            {/* Disparar Evento Socket.IO */}
            <div className="border-t border-border pt-2 space-y-2">
              <div className="flex items-center gap-1 font-semibold text-text-primary">
                <Zap className="h-3.5 w-3.5 text-secondary" />
                <span>Eventos Socket.IO em Tempo Real</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerPriceShift('nft-1')}
                className="w-full text-xs justify-center"
              >
                Disparar <code>nft.updated</code> (+0.5 ETH)
              </Button>
            </div>

            {/* Reset Geral */}
            <div className="border-t border-border pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={resetDb}
                className="w-full text-xs gap-1.5 justify-center"
              >
                <RefreshCw className="h-3 w-3" />
                Restaurar Cenário Padrão (Reset)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
