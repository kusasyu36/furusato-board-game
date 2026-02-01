'use client';

import { Player, ROLE_LABELS, ROLE_COLORS } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { BOARD_CELLS } from '@/constants/board';

interface PlayerStatusProps {
  players: Player[];
  currentPlayerId: string | null;
  myPlayerId: string | null;
}

export function PlayerStatus({ players, currentPlayerId, myPlayerId }: PlayerStatusProps) {
  // ターン順でソート
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="font-bold text-lg mb-3 text-center">プレイヤー</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player) => {
          const isCurrentTurn = player.id === currentPlayerId;
          const isMe = player.id === myPlayerId;
          const cell = BOARD_CELLS[player.position];

          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                isCurrentTurn
                  ? 'border-yellow-400 bg-yellow-50'
                  : isMe
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {/* プレイヤーマーカー */}
                  <div
                    className={`w-4 h-4 rounded-full ${
                      player.role ? ROLE_COLORS[player.role] : 'bg-gray-400'
                    }`}
                  />
                  <span className="font-medium">{player.name}</span>
                  {isMe && (
                    <Badge variant="outline" className="text-xs">
                      あなた
                    </Badge>
                  )}
                </div>
                {isCurrentTurn && (
                  <Badge className="bg-yellow-500 text-xs animate-pulse">ターン中</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {/* 役職 */}
                <div>
                  <span className="text-gray-500 text-xs">役職:</span>
                  <span className="ml-1">
                    {player.role ? ROLE_LABELS[player.role] : '未選択'}
                  </span>
                </div>

                {/* 予算 */}
                <div>
                  <span className="text-gray-500 text-xs">予算:</span>
                  <span className="ml-1 font-medium">{player.budget}</span>
                </div>

                {/* 位置 */}
                <div className="col-span-2">
                  <span className="text-gray-500 text-xs">位置:</span>
                  <span className="ml-1">
                    {cell?.label} ({player.position})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
