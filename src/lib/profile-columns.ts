/**
 * 회원 정보(profiles)에서 누구나 읽을 수 있는 칸 (0018 SQL).
 * 이용 제한 기간·사유는 읽기 권한이 없어서 "*" 로 읽으면 오류가 나므로, 항상 이 칸들만 읽음.
 * 내 이용 제한은 my_ban(), 운영자 회원 목록은 admin_bans() 로 따로 가져옴
 */
export const PROFILE_COLUMNS = "id, nickname, created_at, is_admin, collected_count, contributed_count, contributor_rank, nickname_set";
