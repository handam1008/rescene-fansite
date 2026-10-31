import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui";
import { PRIVACY_EFFECTIVE_DATE, privacyOfficer } from "@/data/privacy";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.privacy.title };
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold">
        {n}. {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-ink-soft [&_b]:text-ink">{children}</div>
    </section>
  );
}

const th = "border border-lilac-200 bg-lilac-50 px-2 py-1.5 text-left font-semibold text-ink";
const td = "border border-lilac-200 px-2 py-1.5 align-top";

/** 본문은 한국어로만 둠 (법적 문서라 번역본과 뜻이 어긋나지 않게). 다른 언어로 볼 때는 위에 안내만 */
export default async function PrivacyPage() {
  const { m } = await getI18n();
  return (
    <div className="mx-auto max-w-3xl">
      {m.privacy.koreanOnly && <p className="mb-4 border border-lilac-200 bg-lilac-50 px-4 py-2.5 text-sm">ℹ️ {m.privacy.koreanOnly}</p>}
      <PageHeader
        eyebrow="Privacy"
        title="개인정보처리방침"
        description={`RESCENE 팬사이트(비공식, 이하 "사이트")가 회원의 개인정보를 어떻게 다루는지 알려드려요. 시행일: ${PRIVACY_EFFECTIVE_DATE}`}
      />

      <div className="card space-y-7 p-5 sm:p-6">
        <Section n={1} title="수집하는 개인정보">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className={th}>언제</th>
                  <th className={th}>항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>이메일로 가입</td>
                  <td className={td}>이메일, 비밀번호(복원할 수 없는 해시로만 저장), 닉네임</td>
                </tr>
                <tr>
                  <td className={td}>구글로 가입·로그인</td>
                  <td className={td}>구글이 보내주는 이메일, 이름, 프로필 사진 주소, 구글 회원 식별값 / 닉네임</td>
                </tr>
                <tr>
                  <td className={td}>카카오로 가입·로그인</td>
                  <td className={td}>카카오가 보내주는 닉네임, 프로필 사진 주소, 카카오 회원 식별값, 이메일(동의한 경우) / 닉네임</td>
                </tr>
                <tr>
                  <td className={td}>사이트를 쓰는 동안</td>
                  <td className={td}>
                    내가 쓴 글·댓글·첨부 사진, 추천·비추천과 신고 기록, 포카 인증 사진과 도감 이미지 공개 동의 여부,
                    운영자에게 보낸 문의와 답변, 응원 롤링페이퍼에 남긴 응원, 퀴즈 배틀 기록(점수·걸린 시간·대결 승패, 이번 주 랭킹에 닉네임과 함께 공개), 가입·로그인 시각
                  </td>
                </tr>
                <tr>
                  <td className={td}>접속할 때 자동으로</td>
                  <td className={td}>
                    IP 주소, 브라우저·기기 정보, 접속 시각 (사이트를 호스팅하는 업체의 서버 기록), 로그인 유지용 쿠키. 홈 화면 원클릭 투표에 참여하면 고른 보기와, 같은 곳에서 몰표를 넣지
                    못하게 IP 주소를 알아볼 수 없게 바꾼 값(해시)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>주민등록번호, 실명, 전화번호, 주소, 결제 정보는 받지 않아요.</p>
        </Section>

        <Section n={2} title="쓰는 목적">
          <ul className="list-inside list-disc space-y-0.5">
            <li>회원 확인과 로그인 유지, 가입 인증 메일 보내기</li>
            <li>게시판·포카 도감·칭호·랭킹 같은 사이트 기능 제공</li>
            <li>신고·문의 처리와 답변, 도배·광고·부정 이용 막기, 게시판 규칙 위반 대응</li>
          </ul>
          <p>광고나 마케팅에는 쓰지 않고, 사이트로 돈을 벌지 않아요.</p>
        </Section>

        <Section n={3} title="보관 기간과 파기">
          <ul className="list-inside list-disc space-y-0.5">
            <li>
              <b>회원 탈퇴하면 바로 지워요.</b> 계정과 함께 글·댓글·추천·신고·문의·포카 인증 기록, 내가 올린 사진 파일이
              삭제돼요. (내 정보 → 회원 탈퇴)
            </li>
            <li>
              도감 이미지로 공개에 동의해 쓰인 사진은 다 같이 채우는 도감의 일부라서 탈퇴 후에도 남고, 제공자 닉네임
              표시만 지워져요. 사진도 지우길 원하면 아래 연락처로 요청해 주세요.
            </li>
            <li>서버 접속 기록은 호스팅 업체의 보관 정책에 따라 짧게 보관된 뒤 자동으로 지워져요.</li>
            <li>서비스 업체의 백업에 남아 있는 정보는 그 업체의 백업 주기에 따라 지워져요.</li>
          </ul>
          <p>지울 때는 데이터베이스와 저장소에서 복구할 수 없게 삭제해요.</p>
        </Section>

        <Section n={4} title="다른 곳에 주는 경우">
          <p>
            회원의 개인정보를 다른 사람이나 회사에 주지 않아요. 다만 법령에 따라 수사기관 등이 정해진 절차로 요청하는
            경우는 예외예요.
          </p>
        </Section>

        <Section n={5} title="처리 위탁과 국외 이전">
          <p>사이트를 운영하는 데 필요한 아래 서비스에 개인정보 처리를 맡기고 있고, 이 과정에서 정보가 국외에 저장돼요.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className={th}>업체 (국가)</th>
                  <th className={th}>맡기는 일</th>
                  <th className={th}>옮겨지는 정보</th>
                  <th className={th}>저장 위치</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>Supabase Inc. (미국)</td>
                  <td className={td}>회원·로그인 관리, 데이터베이스, 사진 저장, 가입 인증 메일</td>
                  <td className={td}>1번의 회원 정보와 사이트 이용 정보 전부</td>
                  <td className={td}>일본 (도쿄)</td>
                </tr>
                <tr>
                  <td className={td}>Vercel Inc. (미국)</td>
                  <td className={td}>웹사이트 호스팅, 쿠키 없는 방문 통계(어느 페이지·어느 사이트에서 왔는지)</td>
                  <td className={td}>접속 기록(IP, 브라우저 정보), 요청에 담긴 로그인 쿠키</td>
                  <td className={td}>일본 (도쿄) 및 전 세계 전송망</td>
                </tr>
                <tr>
                  <td className={td}>DeepL SE (독일)</td>
                  <td className={td}>게시판 글·댓글 번역 (방문자가 번역 버튼을 누를 때)</td>
                  <td className={td}>번역할 글 제목·본문 또는 댓글 내용 (닉네임·계정 정보는 보내지 않음)</td>
                  <td className={td}>독일 (EU)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            옮기는 때·방법: 사이트를 이용할 때마다 암호화된 연결(HTTPS)로 전송돼요. 보관 기간: 3번과 같아요. 국외 이전을
            원하지 않으면 가입하지 않거나 탈퇴하면 되지만, 그 경우 회원 기능은 쓸 수 없어요.
          </p>
          <p>
            구글·카카오 로그인은 회원이 직접 고른 경우에만, 그 회사에 로그인해서 1번의 정보를 받아오는 방식이에요.
          </p>
        </Section>

        <Section n={6} title="쿠키">
          <p>
            로그인을 유지하려고 쿠키를 써요. 광고·추적 쿠키는 쓰지 않아요. 브라우저 설정에서 쿠키를 막을 수 있지만, 그러면
            로그인이 안 돼요. 같은 글의 조회수가 새로고침마다 오르지 않게, 본 글 번호를 브라우저 탭에 잠깐 기억해요(탭을
            닫으면 지워짐). 원클릭 투표는 로그인 없이 한 표만 넣도록 브라우저에 무작위 번호와 고른 보기를 기억해요.
          </p>
        </Section>

        <Section n={7} title="회원의 권리">
          <ul className="list-inside list-disc space-y-0.5">
            <li>내 정보 보기와 닉네임 바꾸기: 로그인 → 위쪽 닉네임 → 내 정보</li>
            <li>글·댓글 지우기: 각 글에서 직접 삭제</li>
            <li>모든 정보 지우기: 내 정보 → 회원 탈퇴</li>
            <li>그 밖에 열람·정정·삭제·처리 정지 요청: 문의 화면이나 아래 연락처로 요청하면 지체 없이 처리해요</li>
          </ul>
        </Section>

        <Section n={8} title="만 14세 미만">
          <p>만 14세 미만은 보호자 동의 절차를 갖추지 않아 가입할 수 없어요. 확인되면 계정을 삭제해요.</p>
        </Section>

        <Section n={9} title="안전하게 지키기 위한 조치">
          <ul className="list-inside list-disc space-y-0.5">
            <li>비밀번호는 원래 값으로 되돌릴 수 없는 해시(bcrypt)로만 저장해요. 운영자도 볼 수 없어요.</li>
            <li>모든 연결은 HTTPS로 암호화돼요.</li>
            <li>데이터베이스 접근 규칙으로 본인 정보는 본인만 바꿀 수 있고, 포카 인증 원본 사진은 본인과 운영자만 볼 수 있어요.</li>
            <li>관리자 기능은 운영자 계정에서만 쓸 수 있어요.</li>
          </ul>
        </Section>

        <Section n={10} title="개인정보 보호책임자와 문의">
          <p>
            <b>
              {privacyOfficer.name} ({privacyOfficer.role})
            </b>
            <br />
            연락처: {privacyOfficer.contact || "사이트의 문의 화면"}{" "}
            <Link href="/contact" className="underline">
              (문의하기)
            </Link>
          </p>
          <p>개인정보 침해로 도움이 필요하면 아래 기관에도 문의할 수 있어요.</p>
          <ul className="list-inside list-disc space-y-0.5">
            <li>개인정보침해 신고센터: (국번 없이) 118 · privacy.kisa.or.kr</li>
            <li>개인정보 분쟁조정위원회: 1833-6972 · kopico.go.kr</li>
            <li>대검찰청: (국번 없이) 1301 · spo.go.kr</li>
            <li>경찰청: (국번 없이) 182 · ecrm.police.go.kr</li>
          </ul>
        </Section>

        <Section n={11} title="방침이 바뀌면">
          <p>내용이 바뀌면 시행 7일 전부터 사이트에 알려요. 이 방침은 {PRIVACY_EFFECTIVE_DATE}부터 적용돼요.</p>
        </Section>
      </div>
    </div>
  );
}
