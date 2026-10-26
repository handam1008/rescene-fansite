/** 리센느 멤버. 포카 올리기·필터에 사용됩니다. */
export const members = ["원이", "리브", "미나미", "메이", "제나"] as const;

/** 포카 멤버 선택지 (멤버 + 단체) */
export const photocardMembers = [...members, "단체"] as const;
