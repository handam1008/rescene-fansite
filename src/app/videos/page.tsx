import type { Metadata } from "next";
import VideoFeed from "@/components/VideoFeed";
import { PageHeader } from "@/components/ui";
import { getVideoChannels, getVideos } from "@/lib/videos";

export const metadata: Metadata = { title: "영상" };

// 새 영상을 15분마다 다시 가져옴
export const revalidate = 900;

export default async function VideosPage() {
  const channels = await getVideoChannels();
  const videos = await getVideos(300, channels);

  return (
    <>
      <PageHeader
        eyebrow="Videos"
        title="영상"
        description="리센느 공식 채널과 팬튜브의 새 영상을 한곳에 모았어요. 15분마다 자동으로 새로 가져오고, 누르면 여기서 바로 재생돼요."
      />
      <VideoFeed videos={videos} channels={channels} />
      <p className="mt-10 text-xs text-ink-soft">
        영상은 각 채널의 유튜브 플레이어로 재생되며 저작권은 각 채널과 권리자에게 있어요. 팬튜브 채널 추천이나 목록에서 빼달라는 요청은
        게시판에 남겨주세요.
      </p>
    </>
  );
}
