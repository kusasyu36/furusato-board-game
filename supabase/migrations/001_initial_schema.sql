-- ふるさと魅力発見ボードゲーム 初期スキーマ

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ルームテーブル
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_turn INTEGER NOT NULL DEFAULT 0,
  current_phase VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (current_phase IN ('waiting', 'roll', 'move', 'action', 'event', 'end_turn', 'finished')),
  current_year INTEGER NOT NULL DEFAULT 1,
  current_player_id UUID,
  host_player_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- プレイヤーテーブル
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('citizen', 'business', 'government', 'visitor')),
  position INTEGER NOT NULL DEFAULT 0,
  budget INTEGER NOT NULL DEFAULT 500,
  rank INTEGER NOT NULL DEFAULT 0,
  is_ready BOOLEAN NOT NULL DEFAULT FALSE,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ゲーム状態テーブル
CREATE TABLE game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
  happiness_connection INTEGER NOT NULL DEFAULT 50 CHECK (happiness_connection >= 0 AND happiness_connection <= 100),
  happiness_culture INTEGER NOT NULL DEFAULT 50 CHECK (happiness_culture >= 0 AND happiness_culture <= 100),
  happiness_safety INTEGER NOT NULL DEFAULT 50 CHECK (happiness_safety >= 0 AND happiness_safety <= 100),
  happiness_health INTEGER NOT NULL DEFAULT 50 CHECK (happiness_health >= 0 AND happiness_health <= 100),
  happiness_environment INTEGER NOT NULL DEFAULT 50 CHECK (happiness_environment >= 0 AND happiness_environment <= 100),
  population INTEGER NOT NULL DEFAULT 10000,
  related_population INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 手札テーブル
CREATE TABLE player_hands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  card_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ゲームログテーブル
CREATE TABLE game_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_game_states_room_id ON game_states(room_id);
CREATE INDEX idx_player_hands_player_id ON player_hands(player_id);
CREATE INDEX idx_game_logs_room_id ON game_logs(room_id);

-- 外部キー制約（循環参照のため後から追加）
ALTER TABLE rooms
  ADD CONSTRAINT fk_rooms_current_player
  FOREIGN KEY (current_player_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE rooms
  ADD CONSTRAINT fk_rooms_host_player
  FOREIGN KEY (host_player_id) REFERENCES players(id) ON DELETE SET NULL;

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at
  BEFORE UPDATE ON game_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS（Row Level Security）ポリシー
-- 今回はシンプルに全ての操作を許可（認証なしのプロトタイプ）
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;

-- 全ての操作を許可するポリシー
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on game_states" ON game_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on player_hands" ON player_hands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on game_logs" ON game_logs FOR ALL USING (true) WITH CHECK (true);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE game_logs;
