import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAutoComPayments } from "@/hooks/useAutoComPayments";
import { AgentNameServiceModal } from "@/components/names/AgentNameServiceModal";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      {
        title: "AutoCom - Agent Name Sales Leaderboard (Primary, Secondary, Auctions)",
      },
      {
        name: "description",
        content:
          "All-time top sales leaderboard of sovereign .agent handles across Primary registrations, Secondary marketplace trades, and Special Auctions.",
      },
      {
        property: "og:title",
        content: "AutoCom - Agent Name Sales Leaderboard",
      },
      {
        property: "og:description",
        content:
          "All-time top sales leaderboard of sovereign .agent handles across Primary registrations, Secondary marketplace trades, and Special Auctions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardRouteComponent,
});

function LeaderboardRouteComponent() {
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
      initialTab="leaderboard"
      onClose={handleReturnHome}
      walletAddress={walletState.address}
      userUsdcBalance={walletState.balances.USDC}
    />
  );
}
