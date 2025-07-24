import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(decimals)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(decimals)}M`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(decimals)}K`;
  }
  return `$${num.toFixed(decimals)}`;
}

export function formatPercentage(num: number, decimals: number = 2): string {
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-warning-600';
  return 'text-danger-600';
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'badge-success';
  if (score >= 60) return 'badge-warning';
  return 'badge-danger';
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return 'text-success-600';
    case 'medium': return 'text-warning-600';
    case 'high': return 'text-danger-600';
    default: return 'text-gray-600';
  }
}

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case 'strong_buy': return 'text-success-700';
    case 'buy': return 'text-success-600';
    case 'hold': return 'text-warning-600';
    case 'sell': return 'text-danger-600';
    case 'strong_sell': return 'text-danger-700';
    default: return 'text-gray-600';
  }
}

export function calculateFloatPercentage(circulating: number, total: number): number {
  return (circulating / total) * 100;
}

export function isUnlockRisky(unlockDate: string, unlockPercentage: number): boolean {
  const unlockDateObj = new Date(unlockDate);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  return unlockDateObj < sixMonthsFromNow && unlockPercentage > 5;
}