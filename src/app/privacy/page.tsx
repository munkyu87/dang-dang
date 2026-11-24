import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal-doc";

export const metadata: Metadata = { title: "개인정보 처리방침 | 땅땅!" };

export default function PrivacyPage() {
  return (
    <LegalDoc title="개인정보 처리방침">
      <LegalSection title="수집하는 내용">
        <p>계정, 실명, 전화번호, 이메일은 받지 않습니다.</p>
        <p>사건명, 카테고리, 선택 설명, 진술, 추가 답변, 선택한 판사, 공유 동의 시각을 저장합니다. 이용자가 그 안에 개인정보를 적으면 함께 저장됩니다.</p>
        <p>접속 유지를 위해 사건 세션 쿠키와 브라우저 식별 쿠키를 사용합니다. 하루 생성 한도를 위해 IP는 원문 대신 해시만 남깁니다.</p>
        <p>AI 사용 기록에는 모델 이름, 토큰 수, 비용, 처리 시간, 성공 여부만 남기고 진술 원문은 넣지 않습니다.</p>
      </LegalSection>
      <LegalSection title="이용하는 목적">
        <p>가상 판결을 만들고, 같은 사람이 하루 한도를 넘지 않게 하며, AI 비용을 관리하기 위해 사용합니다.</p>
        <p>광고 프로필을 만들거나 진술을 판매하지 않습니다.</p>
      </LegalSection>
      <LegalSection title="외부 AI">
        <p>관리자가 mock으로 두면 진술은 이 서버 안에서만 처리되고 외부 AI로 나가지 않습니다.</p>
        <p>OpenAI 호환 API를 연결하면 진술, 추가 답변, 사건 제목과 분류가 그 업체의 서버로 전송됩니다. 처리 국가와 보관, 학습 여부는 그 업체의 정책을 따릅니다. 공개 출시 전에 그 정책을 확인해야 합니다.</p>
        <p>API 키는 암호화해서 저장하고 화면에 다시 보여 주지 않습니다.</p>
      </LegalSection>
      <LegalSection title="카카오톡">
        <p>카카오톡으로 보내기를 누를 때만 공유 주소와 미리보기 정보가 카카오 공유 화면으로 전달됩니다. 사이트는 카카오 계정으로 로그인시키지 않습니다.</p>
      </LegalSection>
      <LegalSection title="보관 기간">
        <p>끝나지 않은 사건은 7일, 끝난 사건은 30일 뒤 접근이 닫힙니다. 삭제하면 바로 접근이 막힙니다.</p>
        <p>지금은 별도의 장기 백업 보관 절차를 두지 않습니다. 데이터는 서비스 서버의 데이터베이스 파일에 있습니다.</p>
      </LegalSection>
      <LegalSection title="이용자의 선택">
        <p>링크를 가진 참여자는 사건을 삭제할 수 있습니다. 공유 동의는 철회할 수 있습니다.</p>
        <p>계정이 없으므로, 링크를 잃어버린 사건의 원문을 운영자가 대신 찾아 주지는 않습니다.</p>
      </LegalSection>
      <LegalSection title="아동">
        <p>아동의 개인정보를 일부러 수집하지 않습니다. 미성년 피해가 의심되는 내용은 판결하지 않고 안내합니다.</p>
      </LegalSection>
    </LegalDoc>
  );
}
