'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createRoom, joinRoom } from '@/lib/supabase/api';

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const { room, player } = await createRoom(playerName.trim());
      // ローカルストレージにプレイヤーIDを保存
      localStorage.setItem(`player_${room.id}`, player.id);
      router.push(`/waiting/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルームの作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }
    if (!roomCode.trim()) {
      setError('ルームコードを入力してください');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const { room, player } = await joinRoom(roomCode.trim(), playerName.trim());
      // ローカルストレージにプレイヤーIDを保存
      localStorage.setItem(`player_${room.id}`, player.id);
      router.push(`/waiting/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルームへの参加に失敗しました');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            ふるさと魅力発見ボードゲーム
          </CardTitle>
          <CardDescription>
            協力して地域の幸福度を高め、持続可能なまちづくりを目指そう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 名前入力 */}
          <div className="space-y-2">
            <Label htmlFor="playerName">あなたの名前</Label>
            <Input
              id="playerName"
              placeholder="名前を入力"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* エラー表示 */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* ルーム作成 */}
          <div className="space-y-2">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleCreateRoom}
              disabled={isCreating || isJoining}
            >
              {isCreating ? '作成中...' : '新しいルームを作成'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          {/* ルーム参加 */}
          <div className="space-y-2">
            <Label htmlFor="roomCode">ルームコード</Label>
            <Input
              id="roomCode"
              placeholder="6桁のコードを入力"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="uppercase tracking-widest text-center text-lg"
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={handleJoinRoom}
              disabled={isCreating || isJoining}
            >
              {isJoining ? '参加中...' : 'ルームに参加'}
            </Button>
          </div>

          {/* ゲーム説明 */}
          <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
            <p className="font-medium">遊び方:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>2〜4人で協力してプレイ</li>
              <li>5年間で幸福度5因子を維持・向上</li>
              <li>人口減少を防ぎ、関係人口を増やそう</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
