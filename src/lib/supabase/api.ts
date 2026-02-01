import { createClient } from './client';
import { Room, Player, GameState, Role } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';

// 6桁のルームコード生成
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// DBレコードをアプリ型に変換
function mapRoomFromDb(row: Record<string, unknown>): Room {
  return {
    id: row.id as string,
    code: row.code as string,
    status: row.status as Room['status'],
    currentTurn: row.current_turn as number,
    currentPhase: row.current_phase as Room['currentPhase'],
    currentYear: row.current_year as number,
    currentPlayerId: row.current_player_id as string | null,
    hostPlayerId: row.host_player_id as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPlayerFromDb(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    name: row.name as string,
    role: row.role as Role | null,
    position: row.position as number,
    budget: row.budget as number,
    rank: row.rank as number,
    isReady: row.is_ready as boolean,
    isOnline: row.is_online as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapGameStateFromDb(row: Record<string, unknown>): GameState {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    happiness: {
      connection: row.happiness_connection as number,
      culture: row.happiness_culture as number,
      safety: row.happiness_safety as number,
      health: row.happiness_health as number,
      environment: row.happiness_environment as number,
    },
    population: row.population as number,
    relatedPopulation: row.related_population as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ルーム作成
export async function createRoom(playerName: string): Promise<{ room: Room; player: Player }> {
  const supabase = createClient();

  // ユニークなコードを生成
  let code = generateRoomCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code)
      .single();

    if (!existing) break;
    code = generateRoomCode();
    attempts++;
  }

  // ルーム作成
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .insert({ code })
    .select()
    .single();

  if (roomError) throw roomError;

  // プレイヤー作成
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: roomData.id,
      name: playerName,
      budget: GAME_CONFIG.INITIAL_BUDGET,
      rank: 1,
    })
    .select()
    .single();

  if (playerError) throw playerError;

  // ルームのホストを設定
  const { error: updateError } = await supabase
    .from('rooms')
    .update({ host_player_id: playerData.id })
    .eq('id', roomData.id);

  if (updateError) throw updateError;

  // ゲーム状態を初期化
  const { error: gameStateError } = await supabase.from('game_states').insert({
    room_id: roomData.id,
    happiness_connection: GAME_CONFIG.INITIAL_HAPPINESS.connection,
    happiness_culture: GAME_CONFIG.INITIAL_HAPPINESS.culture,
    happiness_safety: GAME_CONFIG.INITIAL_HAPPINESS.safety,
    happiness_health: GAME_CONFIG.INITIAL_HAPPINESS.health,
    happiness_environment: GAME_CONFIG.INITIAL_HAPPINESS.environment,
    population: GAME_CONFIG.INITIAL_POPULATION,
    related_population: GAME_CONFIG.INITIAL_RELATED_POPULATION,
  });

  if (gameStateError) throw gameStateError;

  return {
    room: mapRoomFromDb({ ...roomData, host_player_id: playerData.id }),
    player: mapPlayerFromDb(playerData),
  };
}

// ルームに参加
export async function joinRoom(
  roomCode: string,
  playerName: string
): Promise<{ room: Room; player: Player }> {
  const supabase = createClient();

  // ルームを検索
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .select()
    .eq('code', roomCode.toUpperCase())
    .single();

  if (roomError || !roomData) {
    throw new Error('ルームが見つかりません');
  }

  if (roomData.status !== 'waiting') {
    throw new Error('このルームは既にゲームが開始されています');
  }

  // 現在のプレイヤー数を確認
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id')
    .eq('room_id', roomData.id);

  if (playersError) throw playersError;

  if (players && players.length >= GAME_CONFIG.MAX_PLAYERS) {
    throw new Error('ルームが満員です');
  }

  // プレイヤー作成
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: roomData.id,
      name: playerName,
      budget: GAME_CONFIG.INITIAL_BUDGET,
      rank: (players?.length || 0) + 1,
    })
    .select()
    .single();

  if (playerError) throw playerError;

  return {
    room: mapRoomFromDb(roomData),
    player: mapPlayerFromDb(playerData),
  };
}

// ルーム取得
export async function getRoom(roomId: string): Promise<Room | null> {
  const supabase = createClient();

  const { data, error } = await supabase.from('rooms').select().eq('id', roomId).single();

  if (error || !data) return null;
  return mapRoomFromDb(data);
}

// ルームをコードで取得
export async function getRoomByCode(code: string): Promise<Room | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) return null;
  return mapRoomFromDb(data);
}

// プレイヤー一覧取得
export async function getPlayers(roomId: string): Promise<Player[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select()
    .eq('room_id', roomId)
    .order('rank', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapPlayerFromDb);
}

// プレイヤー取得
export async function getPlayer(playerId: string): Promise<Player | null> {
  const supabase = createClient();

  const { data, error } = await supabase.from('players').select().eq('id', playerId).single();

  if (error || !data) return null;
  return mapPlayerFromDb(data);
}

// プレイヤー更新
export async function updatePlayer(
  playerId: string,
  updates: Partial<{ role: Role | null; isReady: boolean; position: number; budget: number }>
): Promise<Player> {
  const supabase = createClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.isReady !== undefined) dbUpdates.is_ready = updates.isReady;
  if (updates.position !== undefined) dbUpdates.position = updates.position;
  if (updates.budget !== undefined) dbUpdates.budget = updates.budget;

  const { data, error } = await supabase
    .from('players')
    .update(dbUpdates)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  return mapPlayerFromDb(data);
}

// ゲーム状態取得
export async function getGameState(roomId: string): Promise<GameState | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('game_states')
    .select()
    .eq('room_id', roomId)
    .single();

  if (error || !data) return null;
  return mapGameStateFromDb(data);
}

// ゲーム状態更新
export async function updateGameState(
  roomId: string,
  updates: Partial<GameState['happiness']> & {
    population?: number;
    relatedPopulation?: number;
  }
): Promise<GameState> {
  const supabase = createClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.connection !== undefined) dbUpdates.happiness_connection = updates.connection;
  if (updates.culture !== undefined) dbUpdates.happiness_culture = updates.culture;
  if (updates.safety !== undefined) dbUpdates.happiness_safety = updates.safety;
  if (updates.health !== undefined) dbUpdates.happiness_health = updates.health;
  if (updates.environment !== undefined) dbUpdates.happiness_environment = updates.environment;
  if (updates.population !== undefined) dbUpdates.population = updates.population;
  if (updates.relatedPopulation !== undefined) dbUpdates.related_population = updates.relatedPopulation;

  const { data, error } = await supabase
    .from('game_states')
    .update(dbUpdates)
    .eq('room_id', roomId)
    .select()
    .single();

  if (error) throw error;
  return mapGameStateFromDb(data);
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
  const supabase = createClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.currentTurn !== undefined) dbUpdates.current_turn = updates.currentTurn;
  if (updates.currentPhase !== undefined) dbUpdates.current_phase = updates.currentPhase;
  if (updates.currentYear !== undefined) dbUpdates.current_year = updates.currentYear;
  if (updates.currentPlayerId !== undefined) dbUpdates.current_player_id = updates.currentPlayerId;

  const { data, error } = await supabase
    .from('rooms')
    .update(dbUpdates)
    .eq('id', roomId)
    .select()
    .single();

  if (error) throw error;
  return mapRoomFromDb(data);
}

// ゲーム開始
export async function startGame(roomId: string): Promise<Room> {
  const supabase = createClient();

  // プレイヤー一覧を取得
  const players = await getPlayers(roomId);

  if (players.length < GAME_CONFIG.MIN_PLAYERS) {
    throw new Error(`最低${GAME_CONFIG.MIN_PLAYERS}人のプレイヤーが必要です`);
  }

  // 全員が準備完了か確認
  const allReady = players.every((p) => p.isReady);
  if (!allReady) {
    throw new Error('全員が準備完了していません');
  }

  // 最初のプレイヤーを設定してゲーム開始
  const firstPlayer = players[0];

  const { data, error } = await supabase
    .from('rooms')
    .update({
      status: 'playing',
      current_turn: 1,
      current_phase: 'roll',
      current_player_id: firstPlayer.id,
    })
    .eq('id', roomId)
    .select()
    .single();

  if (error) throw error;
  return mapRoomFromDb(data);
}

// ゲームログ追加
export async function addGameLog(
  roomId: string,
  message: string,
  playerId?: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('game_logs').insert({
    room_id: roomId,
    player_id: playerId || null,
    message,
  });

  if (error) throw error;
}

// ゲームログ取得
export async function getGameLogs(
  roomId: string,
  limit = 50
): Promise<{ id: string; message: string; playerId: string | null; createdAt: string }[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('game_logs')
    .select()
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    message: row.message,
    playerId: row.player_id,
    createdAt: row.created_at,
  }));
}
