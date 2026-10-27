import { CATALOG_BUCKET, POST_IMAGE_BUCKET, supabaseUrl } from "@/lib/supabase/env";

/*
 * 공개 저장소 사진 주소. 서버·브라우저 어디서나 쓸 수 있게 lib/community.ts(서버 전용)와 분리했습니다.
 */

function publicUrl(bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function postImageUrl(path: string) {
  return publicUrl(POST_IMAGE_BUCKET, path);
}

export function catalogImageUrl(path: string) {
  return publicUrl(CATALOG_BUCKET, path);
}
