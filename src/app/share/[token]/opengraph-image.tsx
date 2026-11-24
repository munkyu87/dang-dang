import { ImageResponse } from "next/og";
import { getShareByToken } from "@/server/cases";

export const alt = "땅땅! 가상 판결";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let ratio = "FOR FUN";
  try {
    const share = getShareByToken(token);
    ratio = share.fault ? `A ${share.fault.A}%    B ${share.fault.B}%` : share.verdictType === "NO_FAULT" ? "NO FAULT" : "INCONCLUSIVE";
  } catch {
    ratio = "FOR FUN";
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#7652F4",
          color: "white",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: "#FFE34F" }}>DDANG!</div>
        <div style={{ marginTop: 28, fontSize: 64, fontWeight: 800 }}>{ratio}</div>
        <div style={{ marginTop: 28, fontSize: 32 }}>virtual verdict · no legal effect</div>
      </div>
    ),
    size,
  );
}
