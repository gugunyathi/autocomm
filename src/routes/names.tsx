import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAutoComPayments } from "@/hooks/useAutoComPayments";
import { AgentNameServiceModal } from "@/components/names/AgentNameServiceModal";

type NamesSearchParams = {
  tab?: "search" | "owners" | "leaderboard" | "auctions" | "secondary" | "x402";
};

export const Route = createFileRoute("/names")({
  validateSearch: (search: Record<string, unknown>): NamesSearchParams => {
    const tab = search.tab as NamesSearchParams["tab"];
    return {
      tab:
        tab && ["search", "owners", "leaderboard", "auctions", "secondary", "x402"].includes(tab)
          ? tab
          : undefined,
    };
  },
  head: () => ({
    meta: [
      {
        title: "Autocomm - Agent Name Sales (.agent), Directory of Owners & Leaderboard",
      },
      {
        name: "description",
        content:
          "Claim sovereign merchant and personal .agent names with sliding scale length pricing ($1000/$600/$300/$20/$2/$1/Free), Directory of Owners with search, Leaderboard of sales, and x402 autonomous machine payments on Base, Arc, and Solana.",
      },
      {
        property: "og:title",
        content: "Autocomm - Agent Name Sales (.agent), Directory of Owners & Leaderboard",
      },
      {
        property: "og:description",
        content:
          "Claim sovereign merchant and personal .agent names with sliding scale length pricing ($1000/$600/$300/$20/$2/$1/Free), Directory of Owners with search, Leaderboard of sales, and x402 autonomous machine payments on Base, Arc, and Solana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NamesRouteComponent,
});

function NamesRouteComponent() {
  const router = useRouter();
  const search = Route.useSearch();
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
      initialTab={search.tab || "search"}
      onClose={handleReturnHome}
      walletAddress={walletState.address}
      userUsdcBalance={walletState.balances.USDC}
    />
  );
}
