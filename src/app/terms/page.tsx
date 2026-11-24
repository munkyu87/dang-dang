import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal-doc";

export const metadata: Metadata = { title: "이용약관 | 땅땅!" };

export default function TermsPage() {
  return (
    <LegalDoc title="이용약관">
      <LegalSection title="서비스">
        <p>땅땅!은 로그인 없이 쓰는 재미용 웹입니다. 일상 다툼을 가상 판결로 보여 줍니다.</p>
        <p>법률 자문이나 재판이 아닙니다. 화면에 나오는 비율, 이유, 주문에는 법적 효력이 없습니다.</p>
      </LegalSection>
      <LegalSection title="이용 방법">
        <p>회원가입은 없습니다. 사건을 만든 사람과 초대 링크를 받은 사람이 각자 진술합니다.</p>
        <p>링크를 가진 사람은 그 역할로 들어올 수 있습니다. 서비스는 그 사람이 당사자 본인인지는 확인하지 않습니다.</p>
        <p>체험 재판은 고정된 가상 사건이며 외부 AI를 호출하지 않습니다.</p>
      </LegalSection>
      <LegalSection title="진술">
        <p>진술은 제출하면 수정할 수 없습니다. 일반 욕설과 비난은 그 자체로 막지 않습니다.</p>
        <p>실제 AI를 연결한 경우 진술과 추가 답변은 판결을 만들기 위해 그 AI 업체로 전송됩니다. mock만 쓰는 경우에는 외부로 보내지 않습니다.</p>
        <p>이름, 연락처, 주소, 계정 같은 식별 정보는 적지 않는 것이 좋습니다.</p>
      </LegalSection>
      <LegalSection title="하지 말아야 할 내용">
        <p>범죄, 폭력, 성폭력, 학대, 자해, 미성년 피해, 법적 처벌을 구하는 내용, 다른 사람의 개인정보를 퍼뜨리는 내용은 재미로 판결하지 않습니다.</p>
        <p>그런 내용이 감지되면 판결 대신 긴급 안내를 보여 줍니다.</p>
      </LegalSection>
      <LegalSection title="공유">
        <p>결과는 기본적으로 비공개입니다. 함께 재판은 양쪽이, 혼자 재판은 작성자가 공유에 동의한 뒤에 링크와 이미지가 만들어집니다.</p>
        <p>혼자 재판 공유본에는 사건명 대신 혼자 재판이라고 표시합니다.</p>
        <p>동의를 철회하면 서비스 안 링크는 바로 닫습니다. 이미 저장된 이미지나 메신저에 전달된 내용은 서비스가 되돌리지 못할 수 있습니다.</p>
      </LegalSection>
      <LegalSection title="보관과 삭제">
        <p>끝나지 않은 사건은 7일, 판결이 끝난 사건은 30일이 지나면 열 수 없습니다.</p>
        <p>참여자는 사건을 삭제할 수 있습니다. 삭제하면 접근 링크도 멈춥니다.</p>
      </LegalSection>
      <LegalSection title="책임">
        <p>가상 판결을 보고 한 행동의 책임은 이용자에게 있습니다. 운영자는 결과의 정확성이나 특정 목적에의 적합성을 보장하지 않습니다.</p>
        <p>서비스 내용, 판사, 한도, 외부 AI 연결은 바뀔 수 있습니다.</p>
      </LegalSection>
    </LegalDoc>
  );
}
