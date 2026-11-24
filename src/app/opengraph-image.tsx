import { ImageResponse } from "next/og";

export const alt = "땅땅! AI 일상 재판소";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          color: "#FFE34F",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 92, fontWeight: 800 }}>DDANG!</div>
        <div style={{ marginTop: 24, fontSize: 42, color: "white" }}>AI everyday court</div>
      </div>
    ),
    size,
  );
}
