/**
 * 페이지를 불러오는 동안 바로 보여주는 자리표시 (loading.tsx 에서 사용).
 * 서버가 DB에서 글을 가져오는 동안 화면이 멈춘 것처럼 보이지 않게 합니다.
 */
export default function LoadingList({ title, rows = 10 }: { title: string; rows?: number }) {
  return (
    <div aria-busy="true" aria-label={`${title} 불러오는 중`}>
      <div className="mb-6 sm:mb-8">
        <div className="h-3 w-16 animate-pulse bg-lilac-200" />
        <p className="mt-2 text-2xl font-extrabold sm:text-3xl">{title}</p>
      </div>
      <div className="border-t-2 border-lilac-500 bg-white">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-lilac-100 px-3 py-3">
            <div className="h-3.5 animate-pulse bg-lilac-100" style={{ width: `${45 + ((i * 17) % 40)}%` }} />
            <div className="ml-auto h-3 w-16 animate-pulse bg-lilac-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
