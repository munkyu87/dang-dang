import { notFound } from "next/navigation";
import { InviteClaim } from "@/components/invite-panel";
import { AppError } from "@/lib/errors";
import { peekInvite } from "@/server/cases";

export const dynamic = "force-dynamic";

export default async function InviteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const preview = peekInvite(token);
    return (
      <div className="mx-auto grid max-w-xl gap-4 px-4 py-10">
        <p className="text-sm font-black">{preview.caseNumber} · {preview.role === "A" ? "작성자 링크" : "초대 링크"}</p>
        <h1 className="text-4xl font-black">{preview.title}</h1>
        <p className="font-bold">
          {preview.category} · {preview.judgeName} · {preview.mode === "DUAL" ? "함께 재판" : "혼자 재판"}
        </p>
        <p>재미용이며 법적 효력은 없습니다. 아래 버튼을 눌러야 이 역할로 들어갑니다. 링크를 열람한 것만으로는 참여가 확정되지 않습니다.</p>
        <InviteClaim token={token} />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError) notFound();
    throw error;
  }
}
