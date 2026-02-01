'use client';

import { useState, useEffect, useCallback } from 'react';
import { Room, Player, GameState, Card } from '@/types/game';
import {
  getRoom,
  getPlayers,
  getPlayer,
  getGameState,
  getGameLogs,
} from '@/lib/supabase/api';
import {
  subscribeToRoom,
  subscribeToPlayers,
  subscribeToGameState,
  unsubscribe,
} from '@/lib/supabase/realtime';
import { GameEngine } from '@/lib/game/engine';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseGameStateResult {
  room: Room | null;
  players: Player[];
  currentPlayer: Player | null;
  gameState: GameState | null;
  currentCard: Card | null;
  isMyTurn: boolean;
  isLoading: boolean;
  error: string;
  logs: { id: string; message: string; createdAt: string }[];
  engine: GameEngine | null;
  setCurrentCard: (card: Card | null) => void;
  refreshData: () => Promise<void>;
}

export function useGameState(roomId: string): UseGameStateResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<{ id: string; message: string; createdAt: string }[]>([]);
  const [engine, setEngine] = useState<GameEngine | null>(null);

  // プレイヤーIDを取得
  const getPlayerId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`player_${roomId}`);
  }, [roomId]);

  // データ読み込み
  const refreshData = useCallback(async () => {
    try {
      const playerId = getPlayerId();
      if (!playerId) {
        setError('プレイヤー情報が見つかりません');
        setIsLoading(false);
        return;
      }

      const [roomData, playersData, playerData, gameStateData, logsData] = await Promise.all([
        getRoom(roomId),
        getPlayers(roomId),
        getPlayer(playerId),
        getGameState(roomId),
        getGameLogs(roomId),
      ]);

      if (!roomData) {
        setError('ルームが見つかりません');
        setIsLoading(false);
        return;
      }

      setRoom(roomData);
      setPlayers(playersData);
      setCurrentPlayer(playerData);
      setGameState(gameStateData);
      setLogs(logsData.map((log) => ({
        id: log.id,
        message: log.message,
        createdAt: log.createdAt,
      })));
      setEngine(new GameEngine(roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, getPlayerId]);

  // 初期読み込み
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // リアルタイム購読
  useEffect(() => {
    if (!roomId) return;

    const channels: RealtimeChannel[] = [];

    // ルーム変更の購読
    const roomChannel = subscribeToRoom(roomId, ({ new: newRoom }) => {
      if (newRoom) {
        const raw = newRoom as unknown as Record<string, unknown>;
        const mapped: Room = {
          id: raw.id as string,
          code: raw.code as string,
          status: raw.status as Room['status'],
          currentTurn: raw.current_turn as number,
          currentPhase: raw.current_phase as Room['currentPhase'],
          currentYear: raw.current_year as number,
          currentPlayerId: raw.current_player_id as string | null,
          hostPlayerId: raw.host_player_id as string | null,
          createdAt: raw.created_at as string,
          updatedAt: raw.updated_at as string,
        };
        setRoom(mapped);
        // フェーズが変わったらカードをリセット
        if (mapped.currentPhase === 'roll') {
          setCurrentCard(null);
        }
      }
    });
    channels.push(roomChannel);

    // プレイヤー変更の購読
    const playersChannel = subscribeToPlayers(roomId, () => {
      getPlayers(roomId).then(setPlayers);
      const playerId = getPlayerId();
      if (playerId) {
        getPlayer(playerId).then((p) => p && setCurrentPlayer(p));
      }
    });
    channels.push(playersChannel);

    // ゲーム状態変更の購読
    const gameStateChannel = subscribeToGameState(roomId, ({ new: newState }) => {
      if (newState) {
        const raw = newState as unknown as Record<string, unknown>;
        const mapped: GameState = {
          id: raw.id as string,
          roomId: raw.room_id as string,
          happiness: {
            connection: raw.happiness_connection as number,
            culture: raw.happiness_culture as number,
            safety: raw.happiness_safety as number,
            health: raw.happiness_health as number,
            environment: raw.happiness_environment as number,
          },
          population: raw.population as number,
          relatedPopulation: raw.related_population as number,
          createdAt: raw.created_at as string,
          updatedAt: raw.updated_at as string,
        };
        setGameState(mapped);
      }
    });
    channels.push(gameStateChannel);

    return () => {
      channels.forEach(unsubscribe);
    };
  }, [roomId, getPlayerId]);

  // ログの定期更新
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(async () => {
      const logsData = await getGameLogs(roomId);
      setLogs(logsData.map((log) => ({
        id: log.id,
        message: log.message,
        createdAt: log.createdAt,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [roomId]);

  const isMyTurn = room?.currentPlayerId === currentPlayer?.id;

  return {
    room,
    players,
    currentPlayer,
    gameState,
    currentCard,
    isMyTurn,
    isLoading,
    error,
    logs,
    engine,
    setCurrentCard,
    refreshData,
  };
}
