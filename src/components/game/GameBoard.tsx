'use client';

import { Player, ROLE_COLORS } from '@/types/game';
import { BOARD_CELLS, CELL_TYPE_COLORS } from '@/constants/board';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: string | null;
}

export function GameBoard({ players, currentPlayerId }: GameBoardProps) {
  // 5x4のグリッドで盤面を配置（周回型）
  const gridPositions = [
    // 上段（左から右）: 0-4
    { id: 0, row: 0, col: 0 },
    { id: 1, row: 0, col: 1 },
    { id: 2, row: 0, col: 2 },
    { id: 3, row: 0, col: 3 },
    { id: 4, row: 0, col: 4 },
    // 右列（上から下）: 5-8
    { id: 5, row: 1, col: 4 },
    { id: 6, row: 2, col: 4 },
    { id: 7, row: 3, col: 4 },
    { id: 8, row: 4, col: 4 },
    // 下段（右から左）: 9-14
    { id: 9, row: 4, col: 3 },
    { id: 10, row: 4, col: 2 },
    { id: 11, row: 4, col: 1 },
    { id: 12, row: 4, col: 0 },
    // 左列（下から上）: 13-19
    { id: 13, row: 3, col: 0 },
    { id: 14, row: 2, col: 0 },
    { id: 15, row: 1, col: 0 },
    // 中央は空き
    { id: 16, row: 1, col: 1 },
    { id: 17, row: 1, col: 2 },
    { id: 18, row: 1, col: 3 },
    { id: 19, row: 2, col: 1 },
  ];

  // グリッドマッピングを作成
  const grid: (number | null)[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));

  gridPositions.forEach(({ id, row, col }) => {
    if (id < BOARD_CELLS.length) {
      grid[row][col] = id;
    }
  });

  // プレイヤーの位置をマッピング
  const playerPositions: Record<number, Player[]> = {};
  players.forEach((player) => {
    if (!playerPositions[player.position]) {
      playerPositions[player.position] = [];
    }
    playerPositions[player.position].push(player);
  });

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="grid grid-cols-5 gap-1 aspect-square max-w-md mx-auto">
        {grid.map((row, rowIndex) =>
          row.map((cellId, colIndex) => {
            if (cellId === null) {
              return (
                <div key={`${rowIndex}-${colIndex}`} className="bg-gray-100 rounded" />
              );
            }

            const cell = BOARD_CELLS[cellId];
            const cellPlayers = playerPositions[cellId] || [];

            return (
              <div
                key={cellId}
                className={`${CELL_TYPE_COLORS[cell.type]} border-2 rounded-lg p-1 flex flex-col items-center justify-center text-center relative`}
              >
                <span className="text-[10px] font-bold leading-tight">{cell.label}</span>
                <span className="text-[8px] text-gray-700">({cellId})</span>

                {/* プレイヤーマーカー */}
                {cellPlayers.length > 0 && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {cellPlayers.map((player) => (
                      <div
                        key={player.id}
                        className={`w-3 h-3 rounded-full border border-white ${
                          player.role ? ROLE_COLORS[player.role] : 'bg-gray-400'
                        } ${player.id === currentPlayerId ? 'ring-2 ring-yellow-400' : ''}`}
                        title={player.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${CELL_TYPE_COLORS.start.split(' ')[0]}`} />
          <span>スタート</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${CELL_TYPE_COLORS.action.split(' ')[0]}`} />
          <span>アクション</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${CELL_TYPE_COLORS.event.split(' ')[0]}`} />
          <span>イベント</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded ${CELL_TYPE_COLORS.special.split(' ')[0]}`} />
          <span>特殊</span>
        </div>
      </div>
    </div>
  );
}
