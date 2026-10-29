/** 문의: 회원이 운영자에게 건의·신고·오류 제보 */

const ko = {
  contact: {
    title: "문의",
    desc: "건의하고 싶은 것, 신고할 일, 사이트 오류를 운영자에게 알려주세요. 답변이 오면 알림으로 알려드려요.",
    category: "분류",
    categories: { suggestion: "건의·제안", report: "신고", bug: "오류 제보", other: "기타" } as Record<string, string>,
    content: "내용",
    placeholder: "자세히 적어주실수록 빨리 처리할 수 있어요. 신고라면 글 주소나 닉네임도 같이 적어주세요.",
    note: "문의는 나와 운영자만 볼 수 있어요. 비밀번호 같은 민감한 정보는 적지 마세요. 하루에 5개까지 보낼 수 있어요.",
    send: "보내기",
    sending: "보내는 중…",
    sent: "문의를 보냈어요. 답변이 오면 알림으로 알려드릴게요.",
    errCategory: "분류를 골라주세요.",
    errContent: "내용은 1~2000자로 적어주세요.",
    errLimit: "문의는 하루에 5개까지 보낼 수 있어요. 내일 다시 보내주세요.",
    errSend: "문의를 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
    loginLink: "로그인",
    loginAfter: "하면 운영자에게 문의할 수 있어요.",
    mine: "내 문의",
    empty: "아직 보낸 문의가 없어요.",
    statusOpen: "확인 중",
    statusAnswered: "답변 완료",
    statusClosed: "처리 완료",
    reply: "운영자 답변",
  },
};

export type ContactMessages = typeof ko;

const ja: ContactMessages = {
  contact: {
    title: "お問い合わせ",
    desc: "ご要望・通報・サイトの不具合を管理者にお知らせください。返信があればお知らせでお伝えします。",
    category: "種類",
    categories: { suggestion: "ご要望・ご提案", report: "通報", bug: "不具合の報告", other: "その他" },
    content: "内容",
    placeholder: "詳しく書いていただくほど早く対応できます。通報の場合は投稿のURLやニックネームも書いてください。",
    note: "お問い合わせはあなたと管理者だけが見られます。パスワードなどの大切な情報は書かないでください。1日5件まで送れます。",
    send: "送信",
    sending: "送信中…",
    sent: "お問い合わせを送りました。返信があればお知らせでお伝えします。",
    errCategory: "種類を選んでください。",
    errContent: "内容は1〜2000文字で入力してください。",
    errLimit: "お問い合わせは1日5件までです。また明日お送りください。",
    errSend: "お問い合わせを送れませんでした。しばらくしてからもう一度お試しください。",
    loginLink: "ログイン",
    loginAfter: "すると、管理者にお問い合わせできます。",
    mine: "自分のお問い合わせ",
    empty: "まだお問い合わせはありません。",
    statusOpen: "確認中",
    statusAnswered: "返信済み",
    statusClosed: "対応済み",
    reply: "管理者からの返信",
  },
};

const en: ContactMessages = {
  contact: {
    title: "Contact",
    desc: "Send suggestions, reports or bug reports to the admin. We'll notify you when there's a reply.",
    category: "Type",
    categories: { suggestion: "Suggestion", report: "Report", bug: "Bug report", other: "Other" },
    content: "Message",
    placeholder: "The more detail, the faster we can help. For reports, please include the post link or nickname.",
    note: "Only you and the admin can see your messages. Don't include sensitive info like passwords. Up to 5 per day.",
    send: "Send",
    sending: "Sending…",
    sent: "Sent! We'll notify you when the admin replies.",
    errCategory: "Please choose a type.",
    errContent: "Message must be 1–2000 characters.",
    errLimit: "You can send up to 5 messages a day. Please try again tomorrow.",
    errSend: "Couldn't send your message. Please try again in a moment.",
    loginLink: "Log in",
    loginAfter: " to contact the admin.",
    mine: "My messages",
    empty: "You haven't sent any messages yet.",
    statusOpen: "Pending",
    statusAnswered: "Answered",
    statusClosed: "Resolved",
    reply: "Admin's reply",
  },
};

const contact = { ko, ja, en };
export default contact;
