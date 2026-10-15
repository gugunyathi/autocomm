import { createFileRoute } from "@tanstack/react-router";
import { App } from "./index";

export const Route = createFileRoute("/mesh")({
  head: () => ({
    meta: [
      { title: "AutoCom - 3D Proximity Mesh & Realtime Agentic Commerce" },
      {
        name: "description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere, protected by biometric passkeys.",
      },
      { property: "og:title", content: "AutoCom - 3D Proximity Mesh" },
      {
        property: "og:description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeshRouteComponent,
});

function MeshRouteComponent() {
  return <App initialView="mesh" />;
}
