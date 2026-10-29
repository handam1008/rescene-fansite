"use client";

import LoadingList from "@/components/LoadingList";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";

export default function Loading() {
  const { m } = useI18n();
  return <LoadingList title={fmt(m.board.memberBoard, { name: m.members.memberFallback })} />;
}
