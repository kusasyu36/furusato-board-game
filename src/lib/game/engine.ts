import { Room, Player, GameState, HappinessFactors, Card, CardEffect } from '@/types/game';
import { GAME_CONFIG, HAPPINESS_LABELS } from '@/constants/game';
import { BOARD_CELLS, BOARD_SIZE } from '@/constants/board';
import { ACTION_CARDS, EVENT_CARDS, getCardById } from '@/constants/cards';
import {
  updateRoom,
  updatePlayer,
  updateGameState,
  getPlayers,
  getGameState,
  addGameLog,
} from '@/lib/supabase/api';

// サイコロを振る
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// 次のプレイヤーを取得
export function getNextPlayer(players: Player[], currentPlayerId: string): Player | null {
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
  const currentIndex = sortedPlayers.findIndex((p) => p.id === currentPlayerId);
  if (currentIndex === -1) return null;

  const nextIndex = (currentIndex + 1) % sortedPlayers.length;
  return sortedPlayers[nextIndex];
}

// 新しい位置を計算
export function calculateNewPosition(currentPosition: number, diceValue: number): number {
  return (currentPosition + diceValue) % BOARD_SIZE;
}

// ターン開始が新年度かどうかを判定
export function isNewYear(players: Player[], currentPlayerId: string): boolean {
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
  return sortedPlayers[0]?.id === currentPlayerId;
}

// 幸福度効果を適用
export function applyHappinessEffect(
  current: HappinessFactors,
  effect: Partial<HappinessFactors>
): HappinessFactors {
  const result = { ...current };

  (Object.keys(effect) as (keyof HappinessFactors)[]).forEach((key) => {
    const change = effect[key] || 0;
    result[key] = Math.max(
      GAME_CONFIG.HAPPINESS_MIN,
      Math.min(GAME_CONFIG.HAPPINESS_MAX, result[key] + change)
    );
  });

  return result;
}

// カード効果の説明文を生成
export function describeCardEffect(effect: CardEffect): string {
  const parts: string[] = [];

  if (effect.happiness) {
    (Object.keys(effect.happiness) as (keyof HappinessFactors)[]).forEach((key) => {
      const value = effect.happiness![key];
      if (value) {
        const sign = value > 0 ? '+' : '';
        parts.push(`${HAPPINESS_LABELS[key]}${sign}${value}`);
      }
    });
  }

  if (effect.population) {
    const sign = effect.population > 0 ? '+' : '';
    parts.push(`人口${sign}${effect.population}`);
  }

  if (effect.relatedPopulation) {
    const sign = effect.relatedPopulation > 0 ? '+' : '';
    parts.push(`関係人口${sign}${effect.relatedPopulation}`);
  }

  if (effect.budget) {
    const sign = effect.budget > 0 ? '+' : '';
    parts.push(`予算${sign}${effect.budget}`);
  }

  return parts.join(', ');
}

// ランダムなアクションカードを取得
export function getRandomActionCard(): Card {
  const index = Math.floor(Math.random() * ACTION_CARDS.length);
  return ACTION_CARDS[index];
}

// ランダムなイベントカードを取得
export function getRandomEventCard(): Card {
  const index = Math.floor(Math.random() * EVENT_CARDS.length);
  return EVENT_CARDS[index];
}

// 勝利条件チェック
export function checkVictoryCondition(room: Room, gameState: GameState): boolean {
  if (room.currentYear < GAME_CONFIG.VICTORY_YEAR) return false;

  const happiness = gameState.happiness;
  return (
    happiness.connection >= GAME_CONFIG.VICTORY_HAPPINESS_MIN &&
    happiness.culture >= GAME_CONFIG.VICTORY_HAPPINESS_MIN &&
    happiness.safety >= GAME_CONFIG.VICTORY_HAPPINESS_MIN &&
    happiness.health >= GAME_CONFIG.VICTORY_HAPPINESS_MIN &&
    happiness.environment >= GAME_CONFIG.VICTORY_HAPPINESS_MIN
  );
}

// 敗北条件チェック
export function checkDefeatCondition(gameState: GameState): {
  defeated: boolean;
  reason?: string;
} {
  const happiness = gameState.happiness;

  // いずれかの幸福度が閾値以下
  const lowFactors = (Object.keys(happiness) as (keyof HappinessFactors)[]).filter(
    (key) => happiness[key] <= GAME_CONFIG.DEFEAT_HAPPINESS_THRESHOLD
  );

  if (lowFactors.length > 0) {
    const factorNames = lowFactors.map((key) => HAPPINESS_LABELS[key]).join('、');
    return {
      defeated: true,
      reason: `${factorNames}が限界値を下回りました`,
    };
  }

  // 人口が閾値以下
  if (gameState.population <= GAME_CONFIG.DEFEAT_POPULATION_THRESHOLD) {
    return {
      defeated: true,
      reason: '人口が限界値を下回りました',
    };
  }

  return { defeated: false };
}

// ゲームエンジンクラス
export class GameEngine {
  private roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  // サイコロを振って移動
  async rollAndMove(playerId: string): Promise<{ diceValue: number; newPosition: number; cellType: string }> {
    const players = await getPlayers(this.roomId);
    const player = players.find((p) => p.id === playerId);
    if (!player) throw new Error('プレイヤーが見つかりません');

    const diceValue = rollDice();
    const newPosition = calculateNewPosition(player.position, diceValue);
    const cell = BOARD_CELLS[newPosition];

    // プレイヤー位置を更新
    await updatePlayer(playerId, { position: newPosition });

    // ログ追加
    await addGameLog(
      this.roomId,
      `${player.name}がサイコロで${diceValue}を出し、${cell.label}マスに移動しました`,
      playerId
    );

    // フェーズを更新
    await updateRoom(this.roomId, { currentPhase: 'move' });

    return { diceValue, newPosition, cellType: cell.type };
  }

  // マス効果を処理
  async processCellEffect(playerId: string): Promise<{ card?: Card; message: string }> {
    const players = await getPlayers(this.roomId);
    const player = players.find((p) => p.id === playerId);
    if (!player) throw new Error('プレイヤーが見つかりません');

    const cell = BOARD_CELLS[player.position];

    switch (cell.type) {
      case 'action': {
        const card = getRandomActionCard();
        await updateRoom(this.roomId, { currentPhase: 'action' });
        return { card, message: `アクションカード「${card.name}」を引きました` };
      }
      case 'event': {
        const card = getRandomEventCard();
        await updateRoom(this.roomId, { currentPhase: 'event' });
        return { card, message: `イベント「${card.name}」が発生しました` };
      }
      case 'special': {
        if (cell.label === '補助金') {
          await updatePlayer(playerId, { budget: player.budget + GAME_CONFIG.SUBSIDY_AMOUNT });
          await addGameLog(this.roomId, `${player.name}が補助金${GAME_CONFIG.SUBSIDY_AMOUNT}を獲得しました`, playerId);
          await this.endTurn();
          return { message: `補助金${GAME_CONFIG.SUBSIDY_AMOUNT}を獲得しました` };
        } else if (cell.label === '交流') {
          const gameState = await getGameState(this.roomId);
          if (gameState) {
            await updateGameState(this.roomId, {
              relatedPopulation: gameState.relatedPopulation + GAME_CONFIG.EXCHANGE_POPULATION_BONUS,
            });
            await addGameLog(this.roomId, `交流イベントで関係人口が${GAME_CONFIG.EXCHANGE_POPULATION_BONUS}増加しました`, playerId);
          }
          await this.endTurn();
          return { message: `関係人口が${GAME_CONFIG.EXCHANGE_POPULATION_BONUS}増加しました` };
        } else if (cell.label === '決算') {
          await this.endTurn();
          return { message: '決算マスです。ターン終了' };
        }
        await this.endTurn();
        return { message: '特殊マス効果' };
      }
      case 'start': {
        await this.endTurn();
        return { message: 'スタートマスに戻りました' };
      }
      default: {
        await this.endTurn();
        return { message: 'ターン終了' };
      }
    }
  }

  // アクションカードを実行
  async executeActionCard(
    playerId: string,
    cardId: string,
    cooperatingPlayerIds: string[] = []
  ): Promise<{ success: boolean; message: string }> {
    const card = getCardById(cardId);
    if (!card || card.type !== 'action') {
      return { success: false, message: 'カードが見つかりません' };
    }

    const players = await getPlayers(this.roomId);
    const player = players.find((p) => p.id === playerId);
    if (!player) return { success: false, message: 'プレイヤーが見つかりません' };

    // コスト確認
    if (card.cost && player.budget < card.cost) {
      return { success: false, message: '予算が足りません' };
    }

    // 協力者確認
    if (card.requiredPlayers && cooperatingPlayerIds.length + 1 < card.requiredPlayers) {
      return {
        success: false,
        message: `このカードには${card.requiredPlayers}人の協力が必要です`,
      };
    }

    // コスト支払い
    if (card.cost) {
      await updatePlayer(playerId, { budget: player.budget - card.cost });
    }

    // 効果適用
    const gameState = await getGameState(this.roomId);
    if (gameState && card.effect.happiness) {
      const newHappiness = applyHappinessEffect(gameState.happiness, card.effect.happiness);
      await updateGameState(this.roomId, {
        connection: newHappiness.connection,
        culture: newHappiness.culture,
        safety: newHappiness.safety,
        health: newHappiness.health,
        environment: newHappiness.environment,
        population: gameState.population + (card.effect.population || 0),
        relatedPopulation: gameState.relatedPopulation + (card.effect.relatedPopulation || 0),
      });
    }

    // ログ追加
    const effectDesc = describeCardEffect(card.effect);
    await addGameLog(
      this.roomId,
      `${player.name}が「${card.name}」を実行しました (${effectDesc})`,
      playerId
    );

    await this.endTurn();

    return { success: true, message: `「${card.name}」を実行しました` };
  }

  // イベントカードを処理
  async processEventCard(cardId: string): Promise<{ message: string }> {
    const card = getCardById(cardId);
    if (!card || card.type !== 'event') {
      return { message: 'カードが見つかりません' };
    }

    // 効果適用
    const gameState = await getGameState(this.roomId);
    if (gameState && card.effect.happiness) {
      const newHappiness = applyHappinessEffect(gameState.happiness, card.effect.happiness);
      await updateGameState(this.roomId, {
        connection: newHappiness.connection,
        culture: newHappiness.culture,
        safety: newHappiness.safety,
        health: newHappiness.health,
        environment: newHappiness.environment,
        population: gameState.population + (card.effect.population || 0),
        relatedPopulation: gameState.relatedPopulation + (card.effect.relatedPopulation || 0),
      });
    }

    // ログ追加
    const effectDesc = describeCardEffect(card.effect);
    await addGameLog(this.roomId, `イベント「${card.name}」が発生しました (${effectDesc})`);

    await this.endTurn();

    return { message: `「${card.name}」が発生しました` };
  }

  // アクションをスキップ
  async skipAction(playerId: string): Promise<void> {
    const players = await getPlayers(this.roomId);
    const player = players.find((p) => p.id === playerId);

    await addGameLog(this.roomId, `${player?.name || 'プレイヤー'}がアクションをスキップしました`, playerId);
    await this.endTurn();
  }

  // ターン終了
  async endTurn(): Promise<{ victory: boolean; defeat: boolean; defeatReason?: string; newYear: boolean }> {
    const room = await this.getRoom();
    const players = await getPlayers(this.roomId);
    const gameState = await getGameState(this.roomId);

    if (!room || !gameState) throw new Error('ゲーム状態が見つかりません');

    // 勝利・敗北チェック
    const victory = checkVictoryCondition(room, gameState);
    const defeatResult = checkDefeatCondition(gameState);

    if (victory || defeatResult.defeated) {
      await updateRoom(this.roomId, {
        status: 'finished',
        currentPhase: 'finished',
      });
      return {
        victory,
        defeat: defeatResult.defeated,
        defeatReason: defeatResult.reason,
        newYear: false,
      };
    }

    // 次のプレイヤーへ
    const nextPlayer = getNextPlayer(players, room.currentPlayerId!);
    if (!nextPlayer) throw new Error('次のプレイヤーが見つかりません');

    // 新年度チェック
    const newYear = isNewYear(players, nextPlayer.id);
    let newYearNum = room.currentYear;

    if (newYear) {
      newYearNum = room.currentYear + 1;

      // 年度効果を適用
      await updateGameState(this.roomId, {
        population: gameState.population + GAME_CONFIG.YEARLY_POPULATION_DECAY,
      });

      // 全プレイヤーに予算補助
      for (const player of players) {
        await updatePlayer(player.id, { budget: player.budget + GAME_CONFIG.YEARLY_BUDGET_GRANT });
      }

      await addGameLog(this.roomId, `${newYearNum}年目が始まりました。人口が減少し、各プレイヤーに予算が配られました。`);
    }

    // ルーム更新
    await updateRoom(this.roomId, {
      currentTurn: room.currentTurn + 1,
      currentPhase: 'roll',
      currentYear: newYearNum,
      currentPlayerId: nextPlayer.id,
    });

    return { victory: false, defeat: false, newYear };
  }

  // ルーム情報取得（内部用）
  private async getRoom(): Promise<Room | null> {
    const { getRoom } = await import('@/lib/supabase/api');
    return getRoom(this.roomId);
  }
}
