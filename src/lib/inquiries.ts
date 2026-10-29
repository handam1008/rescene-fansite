/** 문의 (0015). 보낸 회원 본인과 운영자만 볼 수 있음 */

export const INQUIRY_CATEGORIES = ["suggestion", "report", "bug", "other"] as const;
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

/** 하루에 보낼 수 있는 문의 수 (DB 규칙 "send inquiries" 와 같게) */
export const INQUIRY_DAILY_LIMIT = 5;

export type Inquiry = {
  id: number;
  user_id: string;
  category: InquiryCategory;
  content: string;
  created_at: string;
  reply: string | null;
  replied_at: string | null;
  closed_at: string | null;
};

export type InquiryStatus = "open" | "answered" | "closed";

export function inquiryStatus(q: Pick<Inquiry, "replied_at" | "closed_at">): InquiryStatus {
  if (q.replied_at) return "answered";
  if (q.closed_at) return "closed";
  return "open";
}
