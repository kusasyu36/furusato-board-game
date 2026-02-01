'use client';

import { HappinessFactors } from '@/types/game';
import { HAPPINESS_LABELS, HAPPINESS_COLORS, GAME_CONFIG } from '@/constants/game';
import { Progress } from '@/components/ui/progress';

interface HappinessGaugeProps {
  happiness: HappinessFactors;
}

export function HappinessGauge({ happiness }: HappinessGaugeProps) {
  const factors = Object.keys(happiness) as (keyof HappinessFactors)[];

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="font-bold text-lg mb-3 text-center">幸福度5因子</h3>
      <div className="space-y-3">
        {factors.map((factor) => {
          const value = happiness[factor];
          const isLow = value <= GAME_CONFIG.DEFEAT_HAPPINESS_THRESHOLD + 10;
          const isDanger = value <= GAME_CONFIG.DEFEAT_HAPPINESS_THRESHOLD;

          return (
            <div key={factor} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${isDanger ? 'text-red-600' : ''}`}>
                  {HAPPINESS_LABELS[factor]}
                </span>
                <span className={`font-bold ${isDanger ? 'text-red-600' : isLow ? 'text-orange-500' : ''}`}>
                  {value}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={value}
                  className={`h-3 ${isDanger ? 'bg-red-100' : 'bg-gray-100'}`}
                />
                <div
                  className={`absolute top-0 h-3 rounded-full transition-all ${
                    isDanger ? 'bg-red-500' : isLow ? 'bg-orange-400' : HAPPINESS_COLORS[factor]
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 警告表示 */}
      {factors.some((f) => happiness[f] <= GAME_CONFIG.DEFEAT_HAPPINESS_THRESHOLD + 10) && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 text-center">
          ⚠️ 幸福度が低下しています！{GAME_CONFIG.DEFEAT_HAPPINESS_THRESHOLD}以下で敗北
        </div>
      )}
    </div>
  );
}
