import { createFileRoute } from "@tanstack/react-router";
import { AutoComApp } from "@/components/AutoComApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Autocomm - Autonomous Realtime Commerce Network" },
      {
        name: "description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere, protected by biometric passkeys.",
      },
      { property: "og:title", content: "Autocomm - Autonomous Realtime Commerce Network" },
      {
        property: "og:description",
        content:
          "Where your live AI shopping agent negotiates deals within 50 meters on a spinning proximity sphere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexRouteComponent,
});

function IndexRouteComponent() {
  return <AutoComApp initialView="landing" />;
}
