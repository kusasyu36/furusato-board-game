'use client';

import { Room } from '@/types/game';
import { PHASE_LABELS, GAME_CONFIG } from '@/constants/game';
import { Badge } from '@/components/ui/badge';
import { GameRules } from './GameRules';

interface GameHeaderProps {
  room: Room;
}

export function GameHeader({ room }: GameHeaderProps) {
  const yearProgress = (room.currentYear / GAME_CONFIG.VICTORY_YEAR) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* 年度表示 */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-xs text-gray-500">年度</span>
            <p className="text-2xl font-bold text-green-700">{room.currentYear}年目</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="text-center">
            <span className="text-xs text-gray-500">ターン</span>
            <p className="text-lg font-medium">{room.currentTurn}</p>
          </div>
        </div>

        {/* フェーズ表示 */}
        <div className="text-center">
          <Badge
            className={`text-sm ${
              room.currentPhase === 'roll'
                ? 'bg-blue-500'
                : room.currentPhase === 'action'
                ? 'bg-green-500'
                : room.currentPhase === 'event'
                ? 'bg-pink-500'
                : 'bg-gray-500'
            }`}
          >
            {PHASE_LABELS[room.currentPhase]}
          </Badge>
        </div>

        {/* 進捗バー + ヘルプ */}
        <div className="flex items-center gap-3">
          <div className="w-32">
            <div className="text-xs text-gray-500 text-right mb-1">
              {GAME_CONFIG.VICTORY_YEAR}年目クリアまで
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${yearProgress}%` }}
              />
            </div>
          </div>
          <GameRules />
        </div>
      </div>
    </div>
  );
}
