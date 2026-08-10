import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdfbfa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "hsl(347, 62%, 32%)",
          }}
        >
          Sealed
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: "#3f3a38",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Proposal to payment, sealed in one flow.
        </div>
      </div>
    ),
    { ...size },
  );
}
