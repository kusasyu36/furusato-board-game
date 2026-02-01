// モック版リアルタイム - ポーリングで代替
import { Room, Player, GameState } from '@/types/game';
import { getRoom, getPlayers, getGameState } from './mock-api';

type RealtimeCallback<T> = (payload: { new: T; old: T | null }) => void;

interface MockChannel {
  unsubscribe: () => void;
}

// ポーリング間隔（ミリ秒）
const POLLING_INTERVAL = 1000;

// ルームのリアルタイム購読（ポーリング）
export function subscribeToRoom(
  roomId: string,
  onRoomChange: RealtimeCallback<Room>
): MockChannel {
  let lastRoom: Room | null = null;

  const interval = setInterval(async () => {
    const room = await getRoom(roomId);
    if (room && JSON.stringify(room) !== JSON.stringify(lastRoom)) {
      onRoomChange({ new: room, old: lastRoom });
      lastRoom = room;
    }
  }, POLLING_INTERVAL);

  return {
    unsubscribe: () => clearInterval(interval),
  };
}

// プレイヤーリストのリアルタイム購読（ポーリング）
export function subscribeToPlayers(
  roomId: string,
  onPlayersChange: RealtimeCallback<Player>
): MockChannel {
  let lastPlayers: string = '';

  const interval = setInterval(async () => {
    const players = await getPlayers(roomId);
    const playersJson = JSON.stringify(players);
    if (playersJson !== lastPlayers) {
      // 最後のプレイヤーを通知（簡易実装）
      if (players.length > 0) {
        onPlayersChange({ new: players[players.length - 1], old: null });
      }
      lastPlayers = playersJson;
    }
  }, POLLING_INTERVAL);

  return {
    unsubscribe: () => clearInterval(interval),
  };
}

// ゲーム状態のリアルタイム購読（ポーリング）
export function subscribeToGameState(
  roomId: string,
  onGameStateChange: RealtimeCallback<GameState>
): MockChannel {
  let lastState: GameState | null = null;

  const interval = setInterval(async () => {
    const state = await getGameState(roomId);
    if (state && JSON.stringify(state) !== JSON.stringify(lastState)) {
      onGameStateChange({ new: state, old: lastState });
      lastState = state;
    }
  }, POLLING_INTERVAL);

  return {
    unsubscribe: () => clearInterval(interval),
  };
}

// Presence（オンライン状態）の管理 - モック版では無効
export function setupPresence(
  _roomId: string,
  _playerId: string,
  _onPresenceChange: (presenceState: Record<string, unknown[]>) => void
): MockChannel {
  return {
    unsubscribe: () => {},
  };
}

// チャンネルの購読解除
export function unsubscribe(channel: MockChannel): void {
  channel.unsubscribe();
}
