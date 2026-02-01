import { Card } from '@/types/game';

// アクションカード（6枚）
export const ACTION_CARDS: Card[] = [
  {
    id: 'action-001',
    name: '地元商店街活性化',
    type: 'action',
    category: 'economic',
    cost: 100,
    effect: {
      happiness: { connection: 10, culture: 5 },
    },
    description: '地元の商店街を盛り上げるイベントを開催します。つながり+10、文化+5',
  },
  {
    id: 'action-002',
    name: 'テレワーク拠点整備',
    type: 'action',
    category: 'economic',
    cost: 200,
    effect: {
      happiness: { connection: 15 },
    },
    requiredPlayers: 2,
    description: '地域にテレワーク拠点を整備します。つながり+15（協力2人必要）',
  },
  {
    id: 'action-003',
    name: '世代間交流イベント',
    type: 'action',
    category: 'social',
    cost: 50,
    effect: {
      happiness: { connection: 15, culture: 10, health: 5 },
    },
    description: '若者と高齢者の交流イベントを開催します。つながり+15、文化+10、健康+5',
  },
  {
    id: 'action-004',
    name: '地域防災訓練',
    type: 'action',
    category: 'social',
    cost: 80,
    effect: {
      happiness: { safety: 20, connection: 10 },
    },
    requiredPlayers: 3,
    description: '地域全体で防災訓練を実施します。安全+20、つながり+10（協力3人必要）',
  },
  {
    id: 'action-005',
    name: '里山保全活動',
    type: 'action',
    category: 'environment',
    cost: 30,
    effect: {
      happiness: { environment: 15, health: 5 },
    },
    description: '里山の保全活動を行います。環境+15、健康+5',
  },
  {
    id: 'action-006',
    name: 'ゴミ削減キャンペーン',
    type: 'action',
    category: 'environment',
    cost: 60,
    effect: {
      happiness: { environment: 20 },
    },
    requiredPlayers: 2,
    description: '地域全体でゴミ削減に取り組みます。環境+20（協力2人必要）',
  },
];

// イベントカード（4枚）
export const EVENT_CARDS: Card[] = [
  {
    id: 'event-001',
    name: '名産品フェア',
    type: 'event',
    subtype: 'specialty',
    effect: {
      happiness: { culture: 10 },
      relatedPopulation: 30,
    },
    description: '地元の名産品フェアが開催されました！文化+10、関係人口+30',
  },
  {
    id: 'event-002',
    name: '伝統祭り',
    type: 'event',
    subtype: 'festival',
    effect: {
      happiness: { culture: 15, connection: 10 },
      relatedPopulation: 50,
    },
    description: '伝統的なお祭りが開催されました！文化+15、つながり+10、関係人口+50',
  },
  {
    id: 'event-003',
    name: '大雪',
    type: 'event',
    subtype: 'climate',
    effect: {
      happiness: { safety: -10, health: -5 },
    },
    description: '大雪に見舞われました。安全-10、健康-5',
  },
  {
    id: 'event-004',
    name: '観光特集',
    type: 'event',
    subtype: 'tourism',
    effect: {
      happiness: { culture: 5 },
      relatedPopulation: 100,
    },
    description: 'メディアで観光特集が組まれました！文化+5、関係人口+100',
  },
];

// 全カード
export const ALL_CARDS: Card[] = [...ACTION_CARDS, ...EVENT_CARDS];

// カードIDからカードを取得
export function getCardById(cardId: string): Card | undefined {
  return ALL_CARDS.find((card) => card.id === cardId);
}

// カテゴリラベル
export const CATEGORY_LABELS: Record<string, string> = {
  economic: '経済',
  social: '社会',
  environment: '環境',
};

// イベントサブタイプラベル
export const EVENT_SUBTYPE_LABELS: Record<string, string> = {
  specialty: '名産品',
  festival: '祭り',
  climate: '気候',
  tourism: '観光地',
};
