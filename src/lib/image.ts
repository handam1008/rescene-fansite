/**
 * 브라우저에서 사진을 올리기 전에 줄이기.
 * 휴대폰 카메라 사진(3~10MB)은 그대로 올리면 용량 제한(5MB)에 걸리고 무료 저장 공간도 금방 차서,
 * 긴 변을 maxSize 픽셀로 줄이고 JPEG로 다시 저장합니다. GIF(움짤)는 그대로 둡니다.
 */
export async function shrinkImage(file: File, maxSize = 1600, quality = 0.85): Promise<File> {
  if (file.type === "image/gif" || !file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // 브라우저가 읽지 못하는 형식이면 원본 그대로
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
    bitmap.close();
    return file; // 이미 충분히 작음
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff"; // 투명한 PNG가 JPEG에서 검게 나오지 않도록
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

/** 확장자 포함 저장 경로: "<폴더>/<랜덤>.jpg" */
export function storagePath(folder: string, file: File) {
  const ext = file.type === "image/gif" ? "gif" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  return `${folder}/${crypto.randomUUID()}.${ext}`;
}
