import { notFound } from "next/navigation";
import { VerdictCard } from "@/components/verdict-card";
import { AppError } from "@/lib/errors";
import { getShareByToken } from "@/server/cases";

export const dynamic = "force-dynamic";

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
