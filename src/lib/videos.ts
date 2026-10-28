import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * 영상: 공식·팬 유튜브 채널(0015 SQL video_channels)의 새 영상을 채널별 공개 RSS 에서 가져옴.
 * 유튜브 API 키가 필요 없고, 결과는 15분 동안 저장해 두고 씀 (채널마다 최근 15개)
 */

export type VideoKind = "official" | "fan";

export type Video = {
  id: string;
  title: string;
  channelId: string;
  channel: string;
  kind: VideoKind;
  published: string;
  views: number;
  /** 쇼츠(세로 영상) */
  short: boolean;
};

type Channel = { channel_id: string; name: string; kind: VideoKind };

const REVALIDATE = 900;

/** DB 를 못 읽을 때 쓰는 기본 목록 (공식 채널) */
const FALLBACK: Channel[] = [
  { channel_id: "UCtKtCiaWRz-d3EZn2xd1mdA", name: "RESCENE", kind: "official" },
  { channel_id: "UCWpY0eSJtyO-qNAPbKFRSSg", name: "안원잘부", kind: "official" },
];

function decode(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function parseFeed(xml: string, ch: Channel): Video[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(([, e]) => {
    const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(e)?.[1];
    const title = /<title>([^<]*)<\/title>/.exec(e)?.[1];
    const published = /<published>([^<]+)<\/published>/.exec(e)?.[1];
    if (!id || !title || !published) return [];
    return [
      {
        id,
        title: decode(title),
        channelId: ch.channel_id,
        channel: ch.name,
        kind: ch.kind,
        published,
        views: Number(/<media:statistics views="(\d+)"/.exec(e)?.[1] ?? 0),
        short: /href="https:\/\/www\.youtube\.com\/shorts\//.test(e),
      },
    ];
  });
}

async function fetchChannel(ch: Channel): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channel_id}`, {
      next: { revalidate: REVALIDATE },
    });
    return res.ok ? parseFeed(await res.text(), ch) : [];
  } catch {
    // 채널 하나가 실패해도 나머지는 보여줌
    return [];
  }
}

export async function getVideoChannels(): Promise<Channel[]> {
  if (!isSupabaseConfigured) return FALLBACK;
  const { data, error } = await createPublicClient()
    .from("video_channels")
    .select("channel_id, name, kind")
    .order("kind", { ascending: false })
    .order("created_at");
  return error || !data?.length ? FALLBACK : (data as Channel[]);
}

/** 모든 채널의 최근 영상을 올린 순서(최신 먼저)로. 채널 목록을 이미 불러왔으면 넘겨주면 됨 */
export async function getVideos(limit = 150, channelList?: Channel[]): Promise<Video[]> {
  const channels = channelList ?? (await getVideoChannels());
  const lists = await Promise.all(channels.map(fetchChannel));
  return lists
    .flat()
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, limit);
}
