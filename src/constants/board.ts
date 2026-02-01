import { BoardCell } from '@/types/game';

// 盤面（20マス）
export const BOARD_CELLS: BoardCell[] = [
  { id: 0, type: 'start', label: 'スタート' },
  { id: 1, type: 'action', label: 'アクション' },
  { id: 2, type: 'event', label: 'イベント' },
  { id: 3, type: 'action', label: 'アクション' },
  { id: 4, type: 'special', label: '補助金' },
  { id: 5, type: 'action', label: 'アクション' },
  { id: 6, type: 'event', label: 'イベント' },
  { id: 7, type: 'action', label: 'アクション' },
  { id: 8, type: 'action', label: 'アクション' },
  { id: 9, type: 'special', label: '交流' },
  { id: 10, type: 'action', label: 'アクション' },
  { id: 11, type: 'event', label: 'イベント' },
  { id: 12, type: 'action', label: 'アクション' },
  { id: 13, type: 'action', label: 'アクション' },
  { id: 14, type: 'special', label: '補助金' },
  { id: 15, type: 'action', label: 'アクション' },
  { id: 16, type: 'event', label: 'イベント' },
  { id: 17, type: 'action', label: 'アクション' },
  { id: 18, type: 'action', label: 'アクション' },
  { id: 19, type: 'special', label: '決算' },
];

export const BOARD_SIZE = BOARD_CELLS.length;

// マスタイプの色
export const CELL_TYPE_COLORS: Record<string, string> = {
  start: 'bg-yellow-400 border-yellow-600',
  action: 'bg-blue-400 border-blue-600',
  event: 'bg-pink-400 border-pink-600',
  special: 'bg-green-400 border-green-600',
};
