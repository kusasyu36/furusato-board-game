'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameRules } from '@/components/game';
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
      localStorage.setItem(`player_${room.id}`, player.id);
      router.push(`/waiting/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルームへの参加に失敗しました');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-green-800">
            ふるさと魅力発見ボードゲーム
          </h1>
          <p className="text-gray-600">
            協力して地域の幸福度を高め、持続可能なまちづくりを目指そう
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 左側: ゲーム参加フォーム */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ゲームに参加</CardTitle>
              <CardDescription>
                新しくルームを作成するか、既存のルームに参加しましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* ルーム作成 */}
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleCreateRoom}
                disabled={isCreating || isJoining}
              >
                {isCreating ? '作成中...' : '新しいルームを作成'}
              </Button>

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
            </CardContent>
          </Card>

          {/* 右側: ゲーム概要 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ゲーム概要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ストーリー */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700">
                  あなたは地域の関係者の一人。<br />
                  <strong>市民・企業・行政・来訪者</strong>が力を合わせ、<br />
                  <strong>5年間</strong>で地域を活性化させよう！
                </p>
              </div>

              {/* 勝利条件 */}
              <div className="space-y-2">
                <h4 className="font-bold text-green-700">勝利条件</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    5年間を乗り越える
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    全ての幸福度因子が40以上
                  </li>
                </ul>
              </div>

              {/* ゲームの流れ */}
              <div className="space-y-2">
                <h4 className="font-bold">ゲームの流れ</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-100 rounded">サイコロ</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-blue-100 rounded">移動</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-blue-100 rounded">アクション</span>
                  <span>→</span>
                  <span className="px-2 py-1 bg-blue-100 rounded">次へ</span>
                </div>
              </div>

              {/* 幸福度5因子 */}
              <div className="space-y-2">
                <h4 className="font-bold">幸福度5因子</h4>
                <div className="grid grid-cols-5 gap-1 text-xs text-center">
                  <div className="p-1 bg-pink-100 rounded">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mx-auto mb-1" />
                    つながり
                  </div>
                  <div className="p-1 bg-purple-100 rounded">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1" />
                    文化
                  </div>
                  <div className="p-1 bg-blue-100 rounded">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1" />
                    安全
                  </div>
                  <div className="p-1 bg-green-100 rounded">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1" />
                    健康
                  </div>
                  <div className="p-1 bg-emerald-100 rounded">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-1" />
                    環境
                  </div>
                </div>
              </div>

              {/* 詳細ルールボタン */}
              <div className="pt-2 border-t">
                <GameRules />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 遊び方ステップ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">はじめての方へ - 遊び方ステップ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">1</div>
                <h4 className="font-bold mb-1">ルーム作成</h4>
                <p className="text-xs text-gray-600">名前を入力してルームを作成。表示されるコードを仲間に共有</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">2</div>
                <h4 className="font-bold mb-1">役職選択</h4>
                <p className="text-xs text-gray-600">市民・企業・行政・来訪者から役職を選んで準備完了</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">3</div>
                <h4 className="font-bold mb-1">ゲーム開始</h4>
                <p className="text-xs text-gray-600">全員準備完了でスタート！サイコロを振って盤面を進もう</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">4</div>
                <h4 className="font-bold mb-1">協力プレイ</h4>
                <p className="text-xs text-gray-600">アクションカードで幸福度UP！5年間生き残ろう</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center text-xs text-gray-500">
          <p>デモ版：同一ブラウザ内でのみプレイ可能です</p>
        </div>
      </div>
    </div>
  );
}
