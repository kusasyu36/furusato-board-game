'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import {
  GameBoard,
  HappinessGauge,
  PlayerStatus,
  PopulationMeter,
  ActionPanel,
  GameLog,
  GameHeader,
} from '@/components/game';
import { getRandomActionCard, getRandomEventCard } from '@/lib/game/engine';

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const {
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
  } = useGameState(roomId);

  // ゲーム終了時のリダイレクト
  useEffect(() => {
    if (room?.status === 'finished') {
      router.push(`/result/${roomId}`);
    }
  }, [room?.status, roomId, router]);

  // 待機中ならリダイレクト
  useEffect(() => {
    if (room?.status === 'waiting') {
      router.push(`/waiting/${roomId}`);
    }
  }, [room?.status, roomId, router]);

  // カード処理後のコールバック
  const handleCardProcessed = () => {
    setCurrentCard(null);
    refreshData();
  };

  // フェーズ変更時にカードをセット
  useEffect(() => {
    if (room?.currentPhase === 'action' && !currentCard && isMyTurn) {
      setCurrentCard(getRandomActionCard());
    } else if (room?.currentPhase === 'event' && !currentCard && isMyTurn) {
      setCurrentCard(getRandomEventCard());
    }
  }, [room?.currentPhase, currentCard, isMyTurn, setCurrentCard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>ゲームを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !room || !gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center max-w-md">
          <p className="text-red-500 mb-4">{error || 'ゲーム情報が見つかりません'}</p>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => router.push('/')}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* ヘッダー */}
        <GameHeader room={room} />

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左カラム: ゲーム盤面 + アクションパネル */}
          <div className="lg:col-span-5 space-y-4">
            <GameBoard players={players} currentPlayerId={room.currentPlayerId} />
            <ActionPanel
              phase={room.currentPhase}
              isMyTurn={isMyTurn}
              currentCard={currentCard}
              currentPlayer={currentPlayer}
              players={players}
              engine={engine}
              onCardProcessed={handleCardProcessed}
            />
          </div>

          {/* 中央カラム: ステータス */}
          <div className="lg:col-span-4 space-y-4">
            <HappinessGauge happiness={gameState.happiness} />
            <PopulationMeter
              population={gameState.population}
              relatedPopulation={gameState.relatedPopulation}
            />
          </div>

          {/* 右カラム: プレイヤー + ログ */}
          <div className="lg:col-span-3 space-y-4">
            <PlayerStatus
              players={players}
              currentPlayerId={room.currentPlayerId}
              myPlayerId={currentPlayer.id}
            />
            <GameLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
