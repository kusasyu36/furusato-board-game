// API エクスポート - 環境変数に応じてモック版かSupabase版を使用
// Supabaseの環境変数がない場合はモック版（ローカルストレージ）を使用

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 動的インポートで切り替え
export * from './mock-api';

// デバッグ用
if (typeof window !== 'undefined') {
  console.log(`[API] モード: ${USE_MOCK ? 'デモ（ローカルストレージ）' : 'Supabase'}`);
}
