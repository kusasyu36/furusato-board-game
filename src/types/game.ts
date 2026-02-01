// ゲームの型定義

// 役職
export type Role = 'citizen' | 'business' | 'government' | 'visitor';

export const ROLE_LABELS: Record<Role, string> = {
  citizen: '市民',
  business: '企業',
  government: '行政',
  visitor: '来訪者',
};

export const ROLE_COLORS: Record<Role, string> = {
  citizen: 'bg-green-500',
  business: 'bg-blue-500',
  government: 'bg-purple-500',
  visitor: 'bg-orange-500',
};

// ゲームフェーズ
export type GamePhase = 'waiting' | 'roll' | 'move' | 'action' | 'event' | 'end_turn' | 'finished';

// ルームステータス
export type RoomStatus = 'waiting' | 'playing' | 'finished';

// 幸福度5因子
export interface HappinessFactors {
  connection: number;  // つながり
  culture: number;     // 文化・誇り
  safety: number;      // 安全・安心
  health: number;      // 健康
  environment: number; // 環境
}

// ゲーム状態
export interface GameState {
  id: string;
  roomId: string;
  happiness: HappinessFactors;
  population: number;          // 定住人口
  relatedPopulation: number;   // 関係人口
  createdAt: string;
  updatedAt: string;
}

// ルーム
export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  currentTurn: number;
  currentPhase: GamePhase;
  currentYear: number;
  currentPlayerId: string | null;
  hostPlayerId: string | null;
  createdAt: string;
  updatedAt: string;
}

// プレイヤー
export interface Player {
  id: string;
  roomId: string;
  name: string;
  role: Role | null;
  position: number;
  budget: number;
  rank: number;       // ターン順
  isReady: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

// カードカテゴリ
export type CardCategory = 'economic' | 'social' | 'environment';

// カードタイプ
export type CardType = 'action' | 'event';

// イベントサブタイプ
export type EventSubtype = 'specialty' | 'festival' | 'climate' | 'tourism';

// カード効果
export interface CardEffect {
  happiness?: Partial<HappinessFactors>;
  population?: number;
  relatedPopulation?: number;
  budget?: number;
}

// カード
export interface Card {
  id: string;
  name: string;
  type: CardType;
  category?: CardCategory;
  subtype?: EventSubtype;
  cost?: number;
  effect: CardEffect;
  requiredPlayers?: number;  // 協力に必要な人数
  description: string;
}

// 手札
export interface PlayerHand {
  id: string;
  playerId: string;
  cardId: string;
  createdAt: string;
}

// 盤面マス
export interface BoardCell {
  id: number;
  type: 'start' | 'action' | 'event' | 'special';
  label: string;
}

// サイコロ結果
export interface DiceResult {
  value: number;
  rolledAt: string;
}

// ゲームログエントリ
export interface GameLogEntry {
  id: string;
  roomId: string;
  playerId: string | null;
  message: string;
  createdAt: string;
}

// Supabase Realtime用のペイロード型
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T | null;
}
