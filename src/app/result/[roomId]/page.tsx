'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Room, GameState, Player } from '@/types/game';
import { getRoom, getGameState, getPlayers } from '@/lib/supabase/api';
import { GAME_CONFIG, HAPPINESS_LABELS } from '@/constants/game';
import { checkVictoryCondition, checkDefeatCondition } from '@/lib/game/engine';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomData, gameStateData, playersData] = await Promise.all([
          getRoom(roomId),
          getGameState(roomId),
          getPlayers(roomId),
        ]);

        setRoom(roomData);
        setGameState(gameStateData);
        setPlayers(playersData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!room || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-500">結果データが見つかりません</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVictory = checkVictoryCondition(room, gameState);
  const defeatResult = checkDefeatCondition(gameState);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle
            className={`text-3xl ${isVictory ? 'text-green-600' : 'text-red-600'}`}
          >
            {isVictory ? '🎉 ゲームクリア！' : '😢 ゲームオーバー'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 結果メッセージ */}
          <div className="text-center">
            {isVictory ? (
              <p className="text-lg">
                おめでとうございます！{GAME_CONFIG.VICTORY_YEAR}年間、地域を守り抜きました！
              </p>
            ) : (
              <div>
                <p className="text-lg">残念ながら地域は衰退してしまいました...</p>
                {defeatResult.reason && (
                  <p className="text-red-500 mt-2">{defeatResult.reason}</p>
                )}
              </div>
            )}
          </div>

          {/* 最終スコア */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-center mb-3">最終ステータス</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-500">年度</p>
                <p className="text-xl font-bold">{room.currentYear}年目</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-500">ターン数</p>
                <p className="text-xl font-bold">{room.currentTurn}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-500">定住人口</p>
                <p className="text-xl font-bold">{gameState.population.toLocaleString()}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-gray-500">関係人口</p>
                <p className="text-xl font-bold">+{gameState.relatedPopulation.toLocaleString()}</p>
              </div>
            </div>

            {/* 幸福度 */}
            <div className="mt-4">
              <p className="text-center text-gray-500 mb-2">幸福度5因子</p>
              <div className="grid grid-cols-5 gap-1">
                {(Object.keys(gameState.happiness) as (keyof typeof gameState.happiness)[]).map(
                  (key) => (
                    <div key={key} className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-500">{HAPPINESS_LABELS[key]}</p>
                      <p
                        className={`font-bold ${
                          gameState.happiness[key] <= GAME_CONFIG.DEFEAT_HAPPINESS_THRESHOLD
                            ? 'text-red-500'
                            : ''
                        }`}
                      >
                        {gameState.happiness[key]}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* プレイヤー一覧 */}
          <div>
            <h3 className="font-bold text-center mb-2">参加者</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {players.map((player) => (
                <span
                  key={player.id}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {player.name}
                </span>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              ホームに戻る
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                // 新しいゲームを開始
                router.push('/');
              }}
            >
              もう一度遊ぶ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
