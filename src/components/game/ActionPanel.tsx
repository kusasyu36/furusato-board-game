'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Card as CardType, Player, GamePhase } from '@/types/game';
import { GameEngine, describeCardEffect } from '@/lib/game/engine';
import { CATEGORY_LABELS, EVENT_SUBTYPE_LABELS } from '@/constants/cards';

interface ActionPanelProps {
  phase: GamePhase;
  isMyTurn: boolean;
  currentCard: CardType | null;
  currentPlayer: Player | null;
  players: Player[];
  engine: GameEngine | null;
  onCardProcessed: () => void;
}

export function ActionPanel({
  phase,
  isMyTurn,
  currentCard,
  currentPlayer,
  players,
  engine,
  onCardProcessed,
}: ActionPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  // サイコロを振る
  const handleRollDice = async () => {
    if (!engine || !currentPlayer) return;

    setIsProcessing(true);
    setMessage('');

    try {
      const result = await engine.rollAndMove(currentPlayer.id);
      setDiceResult(result.diceValue);
      setMessage(`${result.diceValue}が出ました！`);

      // マス効果を処理
      const cellResult = await engine.processCellEffect(currentPlayer.id);
      if (cellResult.card) {
        onCardProcessed();
      }
      setMessage(cellResult.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // アクションカードを実行
  const handleExecuteAction = async () => {
    if (!engine || !currentPlayer || !currentCard) return;

    setIsProcessing(true);

    try {
      const result = await engine.executeActionCard(currentPlayer.id, currentCard.id);
      setMessage(result.message);
      onCardProcessed();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // アクションをスキップ
  const handleSkipAction = async () => {
    if (!engine || !currentPlayer) return;

    setIsProcessing(true);

    try {
      await engine.skipAction(currentPlayer.id);
      setMessage('アクションをスキップしました');
      onCardProcessed();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // イベントカードを処理
  const handleProcessEvent = async () => {
    if (!engine || !currentCard) return;

    setIsProcessing(true);

    try {
      const result = await engine.processEventCard(currentCard.id);
      setMessage(result.message);
      onCardProcessed();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 他のプレイヤーのターン表示
  if (!isMyTurn) {
    const turnPlayer = players.find((p) => p.id !== currentPlayer?.id);
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">
            {turnPlayer?.name || '他のプレイヤー'}のターンです...
          </p>
          <div className="mt-4 animate-pulse">
            <div className="w-8 h-8 mx-auto bg-gray-300 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">あなたのターン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* サイコロフェーズ */}
        {phase === 'roll' && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">サイコロを振って移動しましょう</p>

            {diceResult && (
              <div className="text-6xl font-bold text-blue-600">{diceResult}</div>
            )}

            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleRollDice}
              disabled={isProcessing}
            >
              {isProcessing ? '処理中...' : 'サイコロを振る 🎲'}
            </Button>
          </div>
        )}

        {/* アクションフェーズ */}
        {phase === 'action' && currentCard && (
          <div className="space-y-4">
            {/* カード表示 */}
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500">アクション</Badge>
                {currentCard.category && (
                  <Badge variant="outline">
                    {CATEGORY_LABELS[currentCard.category]}
                  </Badge>
                )}
              </div>
              <h4 className="font-bold text-lg">{currentCard.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{currentCard.description}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {currentCard.cost && (
                  <span className="px-2 py-1 bg-yellow-100 rounded">
                    コスト: {currentCard.cost}
                  </span>
                )}
                {currentCard.requiredPlayers && (
                  <span className="px-2 py-1 bg-purple-100 rounded">
                    必要人数: {currentCard.requiredPlayers}人
                  </span>
                )}
              </div>

              <div className="mt-2 text-sm text-green-700">
                効果: {describeCardEffect(currentCard.effect)}
              </div>
            </div>

            {/* 予算確認 */}
            {currentCard.cost && currentPlayer && (
              <div className="text-center">
                <span className="text-gray-600">あなたの予算: </span>
                <span className={`font-bold ${
                  currentPlayer.budget < currentCard.cost ? 'text-red-600' : 'text-green-600'
                }`}>
                  {currentPlayer.budget}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleExecuteAction}
                disabled={
                  isProcessing ||
                  (currentCard.cost !== undefined && currentPlayer !== null && currentPlayer.budget < currentCard.cost)
                }
              >
                {isProcessing ? '実行中...' : '実行する'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSkipAction}
                disabled={isProcessing}
              >
                スキップ
              </Button>
            </div>
          </div>
        )}

        {/* イベントフェーズ */}
        {phase === 'event' && currentCard && (
          <div className="space-y-4">
            {/* カード表示 */}
            <div className="p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-pink-500">イベント</Badge>
                {currentCard.subtype && (
                  <Badge variant="outline">
                    {EVENT_SUBTYPE_LABELS[currentCard.subtype]}
                  </Badge>
                )}
              </div>
              <h4 className="font-bold text-lg">{currentCard.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{currentCard.description}</p>

              <div className="mt-2 text-sm text-green-700">
                効果: {describeCardEffect(currentCard.effect)}
              </div>
            </div>

            <Button
              className="w-full bg-pink-600 hover:bg-pink-700"
              onClick={handleProcessEvent}
              disabled={isProcessing}
            >
              {isProcessing ? '処理中...' : 'イベントを確認'}
            </Button>
          </div>
        )}

        {/* メッセージ表示 */}
        {message && (
          <div className="p-3 bg-gray-100 rounded text-center text-sm">{message}</div>
        )}
      </CardContent>
    </Card>
  );
}
