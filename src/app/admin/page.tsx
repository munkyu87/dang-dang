import { redirect } from "next/navigation";
import { AdminSettings } from "@/components/admin-settings";
import { readAiPublic } from "@/server/ai-settings";
import { adminOverview } from "@/server/cases";
import { requireAdmin } from "@/server/current";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  const metrics = adminOverview();
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <h1 className="text-4xl font-black">운영 현황</h1>
      <section className="press grid grid-cols-2 gap-3 bg-white p-5 sm:grid-cols-4">
        <Stat label="오늘 비용" value={`${metrics.costToday}원`} />
        <Stat label="오늘 호출" value={String(metrics.callsToday)} />
        <Stat label="실패 작업" value={String(metrics.failedJobs)} />
        <Stat label="하루 생성 한도" value={String(metrics.caseLimit)} />
      </section>
      <section className="press bg-white p-5">
        <h2 className="font-black">사건 상태</h2>
        <ul className="mt-3 grid gap-1 font-bold">
          {Object.entries(metrics.counts).map(([status, count]) => (
            <li key={status}>
              {status} · {count}
            </li>
          ))}
        </ul>
      </section>
      <AdminSettings budget={metrics.budget} caseLimit={metrics.caseLimit} ai={readAiPublic()} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-black">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
