import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAutoComPayments } from "@/hooks/useAutoComPayments";
import { AgentNameServiceModal } from "@/components/names/AgentNameServiceModal";

export const Route = createFileRoute("/owners")({
  head: () => ({
    meta: [
      {
        title: "AutoCom - Directory of .agent Name Owners & Verified Handles",
      },
      {
        name: "description",
        content:
          "Public verifiable directory of sovereign .agent name owners, merchant anchor stores, and autonomous bot identities across Base, Arc, Solana, and x402.",
      },
      {
        property: "og:title",
        content: "AutoCom - Directory of .agent Name Owners",
      },
      {
        property: "og:description",
        content:
          "Public verifiable directory of sovereign .agent name owners, merchant anchor stores, and autonomous bot identities across Base, Arc, Solana, and x402.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OwnersRouteComponent,
});

function OwnersRouteComponent() {
  const router = useRouter();
  const { walletState } = useAutoComPayments();

  const handleReturnHome = () => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
      window.location.href = "/";
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <AgentNameServiceModal
      isOpen={true}
      isPageMode={true}
      initialTab="owners"
      onClose={handleReturnHome}
      walletAddress={walletState.address}
      userUsdcBalance={walletState.balances.USDC}
    />
  );
}
