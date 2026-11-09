import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAutoComPayments } from "@/hooks/useAutoComPayments";
import { AgentDevPortalModal } from "@/components/developer/AgentDevPortalModal";

export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [
      { title: "Autocomm - Agent API Tokens, Arbitrage Ledger & Developer Hub" },
      {
        name: "description",
        content:
          "Developer portal for Autocomm: Agent API key credentials, 1.5% Web3 arbitrage fee split ledger, bot negotiation playground, and technical how-to guides.",
      },
      { property: "og:title", content: "Autocomm Developer Hub" },
      {
        property: "og:description",
        content:
          "Developer portal for Autocomm: Agent API key credentials, 1.5% Web3 arbitrage fee split ledger, bot negotiation playground, and technical how-to guides.",
      },
    ],
  }),
  component: DeveloperRouteComponent,
});

function DeveloperRouteComponent() {
  const router = useRouter();
  const {
    walletState,
    apiCredentials,
    arbitrageLedger,
    handleGenerateApiKey,
    handleRecordArbitrageSavings,
  } = useAutoComPayments();

  const handleReturnHome = () => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
      window.location.href = "/";
    } else {
      router.navigate({ to: "/" });
    }
  };

  return (
    <AgentDevPortalModal
      isOpen={true}
      isPageMode={true}
      onClose={handleReturnHome}
      walletState={walletState}
      apiCredentials={apiCredentials}
      arbitrageLedger={arbitrageLedger}
      onGenerateApiKey={handleGenerateApiKey}
      onRecordArbitrageSavings={handleRecordArbitrageSavings}
    />
  );
}
