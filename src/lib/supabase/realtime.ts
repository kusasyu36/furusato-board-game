import { createClient } from './client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Room, Player, GameState } from '@/types/game';

type RealtimeCallback<T> = (payload: { new: T; old: T | null }) => void;

// ルームのリアルタイム購読
export function subscribeToRoom(
  roomId: string,
  onRoomChange: RealtimeCallback<Room>
): RealtimeChannel {
  const supabase = createClient();

  return supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        onRoomChange({
          new: payload.new as Room,
          old: payload.old as Room | null,
        });
      }
    )
    .subscribe();
}

// プレイヤーリストのリアルタイム購読
export function subscribeToPlayers(
  roomId: string,
  onPlayersChange: RealtimeCallback<Player>
): RealtimeChannel {
  const supabase = createClient();

  return supabase
    .channel(`players:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onPlayersChange({
          new: payload.new as Player,
          old: payload.old as Player | null,
        });
      }
    )
    .subscribe();
}

// ゲーム状態のリアルタイム購読
export function subscribeToGameState(
  roomId: string,
  onGameStateChange: RealtimeCallback<GameState>
): RealtimeChannel {
  const supabase = createClient();

  return supabase
    .channel(`game_state:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_states',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onGameStateChange({
          new: payload.new as GameState,
          old: payload.old as GameState | null,
        });
      }
    )
    .subscribe();
}

// Presence（オンライン状態）の管理
export function setupPresence(
  roomId: string,
  playerId: string,
  onPresenceChange: (presenceState: Record<string, unknown[]>) => void
): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase.channel(`presence:${roomId}`, {
    config: {
      presence: {
        key: playerId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresenceChange(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('join', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('leave', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          playerId,
          online_at: new Date().toISOString(),
        });
      }
    });

  return channel;
}

// チャンネルの購読解除
export function unsubscribe(channel: RealtimeChannel): void {
  const supabase = createClient();
  supabase.removeChannel(channel);
}
