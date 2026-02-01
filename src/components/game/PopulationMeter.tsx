'use client';

import { GAME_CONFIG } from '@/constants/game';

interface PopulationMeterProps {
  population: number;
  relatedPopulation: number;
}

export function PopulationMeter({ population, relatedPopulation }: PopulationMeterProps) {
  const isDanger = population <= GAME_CONFIG.DEFEAT_POPULATION_THRESHOLD + 1000;
  const isCritical = population <= GAME_CONFIG.DEFEAT_POPULATION_THRESHOLD;

  // 人口のパーセンテージ（初期値を100%として計算）
  const populationPercent = Math.min(
    100,
    (population / GAME_CONFIG.INITIAL_POPULATION) * 100
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="font-bold text-lg mb-3 text-center">人口メーター</h3>

      {/* 定住人口 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">定住人口</span>
          <span className={`font-bold ${isCritical ? 'text-red-600' : isDanger ? 'text-orange-500' : ''}`}>
            {population.toLocaleString()}人
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isCritical ? 'bg-red-500' : isDanger ? 'bg-orange-400' : 'bg-blue-500'
            }`}
            style={{ width: `${populationPercent}%` }}
          />
        </div>
        {isCritical && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ 危機的状況！{GAME_CONFIG.DEFEAT_POPULATION_THRESHOLD.toLocaleString()}人以下で敗北
          </p>
        )}
      </div>

      {/* 関係人口 */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">関係人口</span>
          <span className="font-bold text-green-600">+{relatedPopulation.toLocaleString()}人</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${Math.min(100, (relatedPopulation / 500) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          観光客・移住検討者など地域と関わる人々
        </p>
      </div>

      {/* 総人口 */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-center">
        <span className="text-sm text-gray-600">総関係人口: </span>
        <span className="font-bold text-lg">
          {(population + relatedPopulation).toLocaleString()}人
        </span>
      </div>
    </div>
  );
}
