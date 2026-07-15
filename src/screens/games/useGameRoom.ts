import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

export interface Player { key: string; name: string; host: boolean }

/** Reusable realtime room: presence-tracked players, join-code lobby, broadcast.
 *  `bind` registers the game's own broadcast handlers on the channel, it should
 *  read live game state through refs (closures here capture state at connect time). */
export function useGameRoom(prefix: string, bind: (ch: RealtimeChannel) => void) {
  const { session } = useAuth();
  const clientId = useMemo(() => crypto.randomUUID(), []);
  const defaultName = (session?.user?.email?.split("@")[0]) || ("Gast-" + clientId.slice(0, 4));

  const [name, setName] = useState(defaultName);
  const [view, setView] = useState<"menu" | "room">("menu");
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const bindRef = useRef(bind); bindRef.current = bind;
  const nameRef = useRef(name); nameRef.current = name;

  useEffect(() => () => { if (channelRef.current) supabase.removeChannel(channelRef.current); }, []);

  function connect(roomCode: string, host: boolean) {
    const ch = supabase.channel(`${prefix}:${roomCode}`, { config: { presence: { key: clientId }, broadcast: { self: true } } });
    ch.on("presence", { event: "sync" }, () => {
      const st = ch.presenceState() as Record<string, { name: string; host: boolean }[]>;
      setPlayers(Object.entries(st).map(([key, arr]) => ({ key, name: arr[0]?.name ?? "?", host: !!arr[0]?.host })));
    });
    bindRef.current(ch);
    ch.subscribe(async (status) => { if (status === "SUBSCRIBED") await ch.track({ name: nameRef.current.trim() || defaultName, host }); });
    channelRef.current = ch;
  }

  function createRoom() { const c = Math.random().toString(36).slice(2, 6).toUpperCase(); setCode(c); setIsHost(true); setView("room"); connect(c, true); }
  function joinRoom() { const c = joinCode.trim().toUpperCase(); if (c.length < 4) return; setCode(c); setIsHost(false); setView("room"); connect(c, false); }
  function send(event: string, payload: Record<string, unknown>) { channelRef.current?.send({ type: "broadcast", event, payload }); }

  return { clientId, name, setName, view, code, joinCode, setJoinCode, isHost, players, createRoom, joinRoom, send };
}
