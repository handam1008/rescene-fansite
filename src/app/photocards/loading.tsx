"use client";

import LoadingList from "@/components/LoadingList";
import { useI18n } from "@/i18n/client";

export default function Loading() {
  return <LoadingList title={useI18n().m.pokedex.title} />;
}
