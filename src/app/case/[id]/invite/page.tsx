import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteLinks } from "@/components/invite-panel";
import { Button } from "@/components/ui/button";
import { asView, loadOwnedCase } from "@/server/case-page";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await loadOwnedCase(id);
  if (page.kind === "closed") redirect(`/case/${id}`);
  const view = asView(page);
  if (!view || view.mode !== "DUAL" || view.role !== "A") redirect(`/case/${id}`);
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <p className="text-sm font-black">{view.caseNumber}</p>
      <h1 className="text-4xl font-black">상대를 부르세요</h1>
      <p className="font-bold">링크를 연 사람은 B로 참여합니다. 메신저 미리보기만으로는 참여가 확정되지 않습니다.</p>
      <InviteLinks caseId={view.id} />
      <Button asChild>
        <Link href={view.mySubmitted ? `/case/${view.id}/status` : `/case/${view.id}/statement`}>
          {view.mySubmitted ? "진행 상태 보기" : "내 진술 작성"}
        </Link>
      </Button>
    </div>
  );
}
