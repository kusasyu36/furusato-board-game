'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function GameRules() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          遊び方を見る
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">ふるさと魅力発見ボードゲーム 遊び方</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* ゲーム概要 */}
          <section>
            <h3 className="font-bold text-lg border-b pb-1 mb-2">ゲーム概要</h3>
            <p className="text-gray-700">
              プレイヤーは地域の関係者（市民・企業・行政・来訪者）となり、
              <strong>協力して</strong>地域の幸福度を維持・向上させながら、
              <strong>5年間</strong>を乗り越えることを目指します。
            </p>
          </section>

          {/* 勝利・敗北条件 */}
          <section>
            <h3 className="font-bold text-lg border-b pb-1 mb-2">勝利・敗北条件</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-bold text-green-700 mb-1">勝利条件</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>5年間を乗り越える</li>
                  <li>全ての幸福度因子が40以上</li>
                </ul>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-bold text-red-700 mb-1">敗北条件</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>いずれかの幸福度が20以下</li>
                  <li>人口が5,000人以下</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ゲームの流れ */}
          <section>
            <h3 className="font-bold text-lg border-b pb-1 mb-2">ゲームの流れ</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <p className="font-bold">サイコロを振る</p>
                  <p className="text-gray-600">1〜6の目が出て、その数だけ進みます</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <p className="font-bold">止まったマスの効果</p>
                  <p className="text-gray-600">マスの種類によって異なるイベントが発生</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <p className="font-bold">アクション実行 or イベント発生</p>
                  <p className="text-gray-600">カードの効果で幸福度や人口が変化</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <p className="font-bold">次のプレイヤーへ</p>
                  <p className="text-gray-600">全員が1回ずつ行動すると1年が経過</p>
                </div>
              </div>
            </div>
          </section>

          {/* マスの種類 */}
          <section>
            <h3 className="font-bold text-lg border-b pb-1 mb-2">マスの種類</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-blue-100 rounded flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded" />
                <div>
                  <span className="font-bold">アクション</span>
                  <span className="text-gray-600 text-xs ml-1">カードを引いて実行</span>
                </div>
              </div>
              <div className="p-2 bg-pink-100 rounded flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-400 rounded" />
                <div>
                  <span className="font-bold">イベント</span>
                  <span className="text-gray-600 text-xs ml-1">ランダムイベント発生</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded" />
                <div>
                  <span className="font-bold">特殊</span>
                  <span className="text-gray-600 text-xs ml-1">補助金・交流など</span>
                </div>
              </div>
              <div className="p-2 bg-yellow-100 rounded flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded" />
                <div>
                  <span className="font-bold">スタート</span>
                  <span className="text-gray-600 text-xs ml-1">ゲーム開始地点</span>
                </div>
              </div>
            </div>
          </section>

          {/* 幸福度5因子 */}
          <section>
            <h3 className="font-bold text-lg border-b pb-1 mb-2">幸福度5因子</h3>
            <p className="text-gray-600 mb-2">地域の幸福度を5つの観点で測定します（各0〜100）</p>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div className="flex items-center gap-2 p-2 bg-pink-50 rounded">
                <div className="w-3 h-3 bg-pink-500 rounded-full" />
                <span className="font-medium">つながり</span>
                <span className="text-gray-500">- 地域コミュニティの絆</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="font-medium">文化・誇り</span>
                <span className="text-gray-500">- 地域の伝統と誇り</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="font-medium">安全・安心</span>
                <span className="text-gray-500">- 防災・治安</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-medium">健康</span>
                <span className="text-gray-500">- 住民の健康状態</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="font-medium">環境</span>
                <span className="text-gray-500">- 自然環境の保全</span>
              </div>
            </div>
          </section>

          {/* 役職 */}
          <section>
            <h3 className="font-bold text-lg border-b pb-1 mb-2">役職（4種類）</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-green-100 rounded">
                <span className="font-bold text-green-700">市民</span>
                <p className="text-xs text-gray-600">地域住民として活動</p>
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <span className="font-bold text-blue-700">企業</span>
                <p className="text-xs text-gray-600">地域経済を支える</p>
              </div>
              <div className="p-2 bg-purple-100 rounded">
                <span className="font-bold text-purple-700">行政</span>
                <p className="text-xs text-gray-600">政策を立案・実行</p>
              </div>
              <div className="p-2 bg-orange-100 rounded">
                <span className="font-bold text-orange-700">来訪者</span>
                <p className="text-xs text-gray-600">観光・移住検討者</p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-2">攻略のヒント</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>幸福度は<strong>バランスよく</strong>維持しよう（1つでも20以下で敗北）</li>
              <li>協力カードは効果が大きい！仲間と連携しよう</li>
              <li>毎年人口が減少するので、関係人口を増やそう</li>
              <li>予算が足りない時はスキップも選択肢</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
