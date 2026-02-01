// モック API - Supabaseなしでローカルストレージで動作
import { Room, Player, GameState, Role } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';

// ローカルストレージキー
const STORAGE_KEYS = {
  ROOMS: 'furusato_rooms',
  PLAYERS: 'furusato_players',
  GAME_STATES: 'furusato_game_states',
  GAME_LOGS: 'furusato_game_logs',
};

// ヘルパー関数
function getStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function now(): string {
  return new Date().toISOString();
}

// ルーム作成
export async function createRoom(playerName: string): Promise<{ room: Room; player: Player }> {
  const rooms = getStorage<Room>(STORAGE_KEYS.ROOMS);
  const players = getStorage<Player>(STORAGE_KEYS.PLAYERS);
  const gameStates = getStorage<GameState>(STORAGE_KEYS.GAME_STATES);

  const roomId = generateId();
  const playerId = generateId();
  const code = generateRoomCode();

  const room: Room = {
    id: roomId,
    code,
    status: 'waiting',
    currentTurn: 0,
    currentPhase: 'waiting',
    currentYear: 1,
    currentPlayerId: null,
    hostPlayerId: playerId,
    createdAt: now(),
    updatedAt: now(),
  };

  const player: Player = {
    id: playerId,
    roomId,
    name: playerName,
    role: null,
    position: 0,
    budget: GAME_CONFIG.INITIAL_BUDGET,
    rank: 1,
    isReady: false,
    isOnline: true,
    createdAt: now(),
    updatedAt: now(),
  };

  const gameState: GameState = {
    id: generateId(),
    roomId,
    happiness: { ...GAME_CONFIG.INITIAL_HAPPINESS },
    population: GAME_CONFIG.INITIAL_POPULATION,
    relatedPopulation: GAME_CONFIG.INITIAL_RELATED_POPULATION,
    createdAt: now(),
    updatedAt: now(),
  };

  rooms.push(room);
  players.push(player);
  gameStates.push(gameState);

  setStorage(STORAGE_KEYS.ROOMS, rooms);
  setStorage(STORAGE_KEYS.PLAYERS, players);
  setStorage(STORAGE_KEYS.GAME_STATES, gameStates);

  return { room, player };
}

// ルームに参加
export async function joinRoom(
  roomCode: string,
  playerName: string
): Promise<{ room: Room; player: Player }> {
  const rooms = getStorage<Room>(STORAGE_KEYS.ROOMS);
  const players = getStorage<Player>(STORAGE_KEYS.PLAYERS);

  const room = rooms.find((r) => r.code === roomCode.toUpperCase());
  if (!room) throw new Error('ルームが見つかりません');
  if (room.status !== 'waiting') throw new Error('このルームは既にゲームが開始されています');

  const roomPlayers = players.filter((p) => p.roomId === room.id);
  if (roomPlayers.length >= GAME_CONFIG.MAX_PLAYERS) throw new Error('ルームが満員です');

  const playerId = generateId();
  const player: Player = {
    id: playerId,
    roomId: room.id,
    name: playerName,
    role: null,
    position: 0,
    budget: GAME_CONFIG.INITIAL_BUDGET,
    rank: roomPlayers.length + 1,
    isReady: false,
    isOnline: true,
    createdAt: now(),
    updatedAt: now(),
  };

  players.push(player);
  setStorage(STORAGE_KEYS.PLAYERS, players);

  return { room, player };
}

// ルーム取得
export async function getRoom(roomId: string): Promise<Room | null> {
  const rooms = getStorage<Room>(STORAGE_KEYS.ROOMS);
  return rooms.find((r) => r.id === roomId) || null;
}

// ルームをコードで取得
export async function getRoomByCode(code: string): Promise<Room | null> {
  const rooms = getStorage<Room>(STORAGE_KEYS.ROOMS);
  return rooms.find((r) => r.code === code.toUpperCase()) || null;
}

// プレイヤー一覧取得
export async function getPlayers(roomId: string): Promise<Player[]> {
  const players = getStorage<Player>(STORAGE_KEYS.PLAYERS);
  return players.filter((p) => p.roomId === roomId).sort((a, b) => a.rank - b.rank);
}

// プレイヤー取得
export async function getPlayer(playerId: string): Promise<Player | null> {
  const players = getStorage<Player>(STORAGE_KEYS.PLAYERS);
  return players.find((p) => p.id === playerId) || null;
}

// プレイヤー更新
export async function updatePlayer(
  playerId: string,
  updates: Partial<{ role: Role | null; isReady: boolean; position: number; budget: number }>
): Promise<Player> {
  const players = getStorage<Player>(STORAGE_KEYS.PLAYERS);
  const index = players.findIndex((p) => p.id === playerId);
  if (index === -1) throw new Error('プレイヤーが見つかりません');

  const player = { ...players[index], ...updates, updatedAt: now() };
  players[index] = player;
  setStorage(STORAGE_KEYS.PLAYERS, players);

  return player;
}

// ゲーム状態取得
export async function getGameState(roomId: string): Promise<GameState | null> {
  const gameStates = getStorage<GameState>(STORAGE_KEYS.GAME_STATES);
  return gameStates.find((g) => g.roomId === roomId) || null;
}

// ゲーム状態更新
export async function updateGameState(
  roomId: string,
  updates: Partial<GameState['happiness']> & {
    population?: number;
    relatedPopulation?: number;
  }
): Promise<GameState> {
  const gameStates = getStorage<GameState>(STORAGE_KEYS.GAME_STATES);
  const index = gameStates.findIndex((g) => g.roomId === roomId);
  if (index === -1) throw new Error('ゲーム状態が見つかりません');

  const current = gameStates[index];
  const newHappiness = { ...current.happiness };

  if (updates.connection !== undefined) newHappiness.connection = updates.connection;
  if (updates.culture !== undefined) newHappiness.culture = updates.culture;
  if (updates.safety !== undefined) newHappiness.safety = updates.safety;
  if (updates.health !== undefined) newHappiness.health = updates.health;
  if (updates.environment !== undefined) newHappiness.environment = updates.environment;

  const gameState: GameState = {
    ...current,
    happiness: newHappiness,
    population: updates.population ?? current.population,
    relatedPopulation: updates.relatedPopulation ?? current.relatedPopulation,
    updatedAt: now(),
  };

  gameStates[index] = gameState;
  setStorage(STORAGE_KEYS.GAME_STATES, gameStates);

  return gameState;
}

// ルーム状態更新
export async function updateRoom(
  roomId: string,
  updates: Partial<{
    status: Room['status'];
    currentTurn: number;
    currentPhase: Room['currentPhase'];
    currentYear: number;
    currentPlayerId: string | null;
  }>
): Promise<Room> {
  const rooms = getStorage<Room>(STORAGE_KEYS.ROOMS);
  const index = rooms.findIndex((r) => r.id === roomId);
  if (index === -1) throw new Error('ルームが見つかりません');

  const room = { ...rooms[index], ...updates, updatedAt: now() };
  rooms[index] = room;
  setStorage(STORAGE_KEYS.ROOMS, rooms);

  return room;
}

// ゲーム開始
export async function startGame(roomId: string): Promise<Room> {
  const players = await getPlayers(roomId);

  if (players.length < GAME_CONFIG.MIN_PLAYERS) {
    throw new Error(`最低${GAME_CONFIG.MIN_PLAYERS}人のプレイヤーが必要です`);
  }

  const allReady = players.every((p) => p.isReady);
  if (!allReady) {
    throw new Error('全員が準備完了していません');
  }

  const firstPlayer = players[0];
  return updateRoom(roomId, {
    status: 'playing',
    currentTurn: 1,
    currentPhase: 'roll',
    currentPlayerId: firstPlayer.id,
  });
}

// ゲームログ追加
export async function addGameLog(
  roomId: string,
  message: string,
  playerId?: string
): Promise<void> {
  const logs = getStorage<{ id: string; roomId: string; playerId: string | null; message: string; createdAt: string }>(
    STORAGE_KEYS.GAME_LOGS
  );

  logs.unshift({
    id: generateId(),
    roomId,
    playerId: playerId || null,
    message,
    createdAt: now(),
  });

  // 最新100件のみ保持
  setStorage(STORAGE_KEYS.GAME_LOGS, logs.slice(0, 100));
}

// ゲームログ取得
export async function getGameLogs(
  roomId: string,
  limit = 50
): Promise<{ id: string; message: string; playerId: string | null; createdAt: string }[]> {
  const logs = getStorage<{ id: string; roomId: string; playerId: string | null; message: string; createdAt: string }>(
    STORAGE_KEYS.GAME_LOGS
  );

  return logs
    .filter((l) => l.roomId === roomId)
    .slice(0, limit)
    .map((l) => ({
      id: l.id,
      message: l.message,
      playerId: l.playerId,
      createdAt: l.createdAt,
    }));
}
