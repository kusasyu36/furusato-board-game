import { HappinessFactors } from '@/types/game';

// ゲーム設定
export const GAME_CONFIG = {
  // 最小・最大プレイヤー数
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,

  // 初期値
  INITIAL_BUDGET: 500,
  INITIAL_POPULATION: 10000,
  INITIAL_RELATED_POPULATION: 0,

  // 初期幸福度
  INITIAL_HAPPINESS: {
    connection: 50,
    culture: 50,
    safety: 50,
    health: 50,
    environment: 50,
  } as HappinessFactors,

  // 幸福度の最小・最大
  HAPPINESS_MIN: 0,
  HAPPINESS_MAX: 100,

  // 勝利条件
  VICTORY_YEAR: 5,              // 5年（5周）クリア
  VICTORY_HAPPINESS_MIN: 40,    // 全因子40以上

  // 敗北条件
  DEFEAT_HAPPINESS_THRESHOLD: 20, // いずれかの因子が20以下
  DEFEAT_POPULATION_THRESHOLD: 5000, // 人口が5000以下

  // 年度ごとの効果
  YEARLY_POPULATION_DECAY: -200,  // 毎年の人口減少
  YEARLY_BUDGET_GRANT: 100,       // 毎年の予算補助

  // 補助金マス
  SUBSIDY_AMOUNT: 100,

  // 交流マス効果
  EXCHANGE_POPULATION_BONUS: 50,
};

// 幸福度因子のラベル
export const HAPPINESS_LABELS: Record<keyof HappinessFactors, string> = {
  connection: 'つながり',
  culture: '文化・誇り',
  safety: '安全・安心',
  health: '健康',
  environment: '環境',
};

// 幸福度因子の色
export const HAPPINESS_COLORS: Record<keyof HappinessFactors, string> = {
  connection: 'bg-pink-500',
  culture: 'bg-purple-500',
  safety: 'bg-blue-500',
  health: 'bg-green-500',
  environment: 'bg-emerald-500',
};

// フェーズラベル
export const PHASE_LABELS: Record<string, string> = {
  waiting: '待機中',
  roll: 'サイコロ',
  move: '移動中',
  action: 'アクション',
  event: 'イベント',
  end_turn: 'ターン終了',
  finished: 'ゲーム終了',
};
