"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/auth/actions";
import { getI18n } from "@/i18n/server";
import { INQUIRY_CATEGORIES, INQUIRY_DAILY_LIMIT } from "@/lib/inquiries";
import { createClient } from "@/lib/supabase/server";

/** 문의 보내기. 하루 개수 제한은 DB 규칙(0015)이 막고, 여기서는 알맞은 안내만 */
export async function sendInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const { m } = await getI18n();
  const category = String(formData.get("category") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  if (!(INQUIRY_CATEGORIES as readonly string[]).includes(category)) return { error: m.contact.errCategory };
  if (!content || content.length > 2000) return { error: m.contact.errContent };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/contact");

  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gt("created_at", new Date(Date.now() - 86_400_000).toISOString());
  if ((count ?? 0) >= INQUIRY_DAILY_LIMIT) return { error: m.contact.errLimit };

  const { error } = await supabase.from("inquiries").insert({ category, content });
  if (error) return { error: error.code === "42501" ? m.contact.errLimit : m.contact.errSend };

  revalidatePath("/contact");
  revalidatePath("/admin");
  return { message: m.contact.sent };
}
