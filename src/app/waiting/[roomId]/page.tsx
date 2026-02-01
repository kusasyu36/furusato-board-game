'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Room, Player, Role, ROLE_LABELS, ROLE_COLORS } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';
import {
  getRoom,
  getPlayers,
  getPlayer,
  updatePlayer,
  startGame,
} from '@/lib/supabase/api';
import { subscribeToRoom, subscribeToPlayers, unsubscribe } from '@/lib/supabase/realtime';

const ROLES: Role[] = ['citizen', 'business', 'government', 'visitor'];

export default function WaitingRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // 初期データ読み込み
  const loadData = useCallback(async () => {
    try {
      const playerId = localStorage.getItem(`player_${roomId}`);
      if (!playerId) {
        router.push('/');
        return;
      }

      const [roomData, playersData, playerData] = await Promise.all([
        getRoom(roomId),
        getPlayers(roomId),
        getPlayer(playerId),
      ]);

      if (!roomData) {
        setError('ルームが見つかりません');
        return;
      }

      if (roomData.status === 'playing') {
        router.push(`/room/${roomId}`);
        return;
      }

      setRoom(roomData);
      setPlayers(playersData);
      setCurrentPlayer(playerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // リアルタイム購読
  useEffect(() => {
    if (!roomId) return;

    const channels: RealtimeChannel[] = [];

    // ルーム変更の購読
    const roomChannel = subscribeToRoom(roomId, ({ new: newRoom }) => {
      if (newRoom) {
        const raw = newRoom as unknown as Record<string, unknown>;
        const mappedRoom: Room = {
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
        setRoom(mappedRoom);
        if (mappedRoom.status === 'playing') {
          router.push(`/room/${roomId}`);
        }
      }
    });
    channels.push(roomChannel);

    // プレイヤー変更の購読
    const playersChannel = subscribeToPlayers(roomId, () => {
      // プレイヤーリストを再取得
      getPlayers(roomId).then(setPlayers);
    });
    channels.push(playersChannel);

    return () => {
      channels.forEach(unsubscribe);
    };
  }, [roomId, router]);

  // 役職選択
  const handleSelectRole = async (role: Role) => {
    if (!currentPlayer) return;

    // 既に他のプレイヤーが選択している役職はスキップ
    const takenRoles = players.filter((p) => p.id !== currentPlayer.id).map((p) => p.role);
    if (takenRoles.includes(role)) {
      setError('この役職は既に選択されています');
      return;
    }

    try {
      const updated = await updatePlayer(currentPlayer.id, { role });
      setCurrentPlayer(updated);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '役職の選択に失敗しました');
    }
  };

  // 準備完了
  const handleReady = async () => {
    if (!currentPlayer) return;

    if (!currentPlayer.role) {
      setError('役職を選択してください');
      return;
    }

    try {
      const updated = await updatePlayer(currentPlayer.id, { isReady: !currentPlayer.isReady });
      setCurrentPlayer(updated);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '準備状態の変更に失敗しました');
    }
  };

  // ゲーム開始
  const handleStartGame = async () => {
    if (!room) return;

    setIsStarting(true);
    setError('');

    try {
      await startGame(room.id);
      // リアルタイムで通知されるので自動遷移
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ゲームの開始に失敗しました');
    } finally {
      setIsStarting(false);
    }
  };

  // コードをコピー
  const handleCopyCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-500">{error || 'ルームが見つかりません'}</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHost = room.hostPlayerId === currentPlayer.id;
  const allReady = players.length >= GAME_CONFIG.MIN_PLAYERS && players.every((p) => p.isReady);
  const takenRoles = players.filter((p) => p.id !== currentPlayer.id).map((p) => p.role);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ルームコード */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">ルームコード</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <button
              onClick={handleCopyCode}
              className="text-4xl font-bold tracking-widest text-green-700 hover:text-green-600 transition-colors"
            >
              {room.code}
            </button>
            <p className="text-sm text-gray-500 mt-2">クリックでコピー</p>
          </CardContent>
        </Card>

        {/* プレイヤーリスト */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>プレイヤー ({players.length}/{GAME_CONFIG.MAX_PLAYERS})</span>
              {players.length < GAME_CONFIG.MIN_PLAYERS && (
                <span className="text-sm font-normal text-gray-500">
                  あと{GAME_CONFIG.MIN_PLAYERS - players.length}人必要
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    player.id === currentPlayer.id ? 'bg-green-50 border-green-300' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{player.name}</span>
                    {player.id === room.hostPlayerId && (
                      <Badge variant="secondary">ホスト</Badge>
                    )}
                    {player.role && (
                      <Badge className={ROLE_COLORS[player.role]}>
                        {ROLE_LABELS[player.role]}
                      </Badge>
                    )}
                  </div>
                  <div>
                    {player.isReady ? (
                      <Badge className="bg-green-500">準備完了</Badge>
                    ) : (
                      <Badge variant="outline">準備中</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 役職選択 */}
        <Card>
          <CardHeader>
            <CardTitle>役職を選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const isTaken = takenRoles.includes(role);
                const isSelected = currentPlayer.role === role;
                return (
                  <Button
                    key={role}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`h-auto py-4 ${isSelected ? ROLE_COLORS[role] : ''}`}
                    disabled={isTaken || currentPlayer.isReady}
                    onClick={() => handleSelectRole(role)}
                  >
                    <div className="text-center">
                      <div className="font-bold">{ROLE_LABELS[role]}</div>
                      <div className="text-xs mt-1 opacity-80">
                        {role === 'citizen' && '地域住民として活動'}
                        {role === 'business' && '企業として経済活動'}
                        {role === 'government' && '行政として政策立案'}
                        {role === 'visitor' && '観光客・移住検討者'}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/')}>
            退出
          </Button>
          <Button
            className={`flex-1 ${currentPlayer.isReady ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleReady}
            disabled={!currentPlayer.role}
          >
            {currentPlayer.isReady ? '準備を取り消す' : '準備完了'}
          </Button>
        </div>

        {/* ゲーム開始ボタン（ホストのみ） */}
        {isHost && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
            disabled={!allReady || isStarting}
            onClick={handleStartGame}
          >
            {isStarting ? 'ゲーム開始中...' : 'ゲームを開始する'}
          </Button>
        )}
      </div>
    </div>
  );
}
