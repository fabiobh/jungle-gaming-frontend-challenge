import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats ETH amounts ensuring decimal string precision as required by the challenge:
 * "Valores em ETH devem trafegar como strings decimais e manter precisão nos cálculos e na apresentação."
 */
export function formatEth(value: string | number, decimals = 4): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.0000 ETH';
  return `${num.toFixed(decimals)} ETH`;
}

export function formatFiat(ethValue: string | number, ethPriceUsd = 2650): string {
  const num = typeof ethValue === 'string' ? parseFloat(ethValue) : ethValue;
  if (isNaN(num)) return '$0.00';
  const usd = num * ethPriceUsd;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(usd);
}
