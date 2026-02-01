'use client';

interface GameLogProps {
  logs: { id: string; message: string; createdAt: string }[];
}

export function GameLog({ logs }: GameLogProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="font-bold text-lg mb-3">ゲームログ</h3>
      <div className="h-48 overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">ログがありません</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="text-sm p-2 bg-gray-50 rounded">
              <p>{log.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(log.createdAt).toLocaleTimeString('ja-JP')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
