import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VerdictCard } from "@/components/verdict-card";
import { AppError } from "@/lib/errors";
import { getShareByToken } from "@/server/cases";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const hidden = { index: false, follow: false };
  try {
    const { token } = await params;
    const share = getShareByToken(token);
    const title = "땅땅! 판결 나왔습니다";
    const description = `${share.sourceLabel}. ${share.order} 재미용이며 법적 효력 없음.`.slice(0, 90);
    return { title, description, robots: hidden, openGraph: { title, description, type: "website" } };
  } catch {
    return { robots: hidden };
  }
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const share = getShareByToken(token);
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <VerdictCard
          caseNumber={share.caseNumber}
          title={share.title}
          sourceLabel={share.sourceLabel}
          judgeName={share.judgeName}
          persona={share.judgePersona}
          verdictType={share.verdictType}
          fault={share.fault}
          reason={share.reason}
          order={share.order}
          limitations={share.limitations}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof AppError) notFound();
    throw error;
  }
}
