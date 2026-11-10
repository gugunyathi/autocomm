/**
 * AutoCom PayPal Pay Later Integration Test
 * Verifies autonomous agent 6-month micro-credit financing, 0.5% platform fee calculation,
 * repayment installments, REST API endpoints, and MCP Agent Toolkit integration.
 */

import { describe, it, expect } from "vitest";
import {
  calculatePayLaterPlan,
  requestAgentPayLaterLoan,
  repayAgentPayLaterInstallment,
  getStoredPayLaterLoans,
} from "../services/paypalService";
import {
  PAYPAL_AGENT_TOOLS,
  executePayPalAgentTool,
} from "../services/paypalAgentToolkit";
import { handleApiRoute } from "../services/apiRouter";

describe("PayPal Pay Later 6-Month Autonomous Credit Service", () => {
  it("calculates 6-month repayment plan with strictly 0.5% platform fee", () => {
    const principalZAR = 1000;
    const plan = calculatePayLaterPlan(principalZAR);

    expect(plan.tenureMonths).toBe(6);
    expect(plan.platformFeePercent).toBe(0.5);
    // 0.5% of 1000 is 5.00
    expect(plan.platformFeeZAR).toBe(5);
    // Total = 1000 + 5 = 1005
    expect(plan.totalRepaymentZAR).toBe(1005);
    // Monthly installment = 1005 / 6 = 167.50
    expect(plan.monthlyInstallmentZAR).toBe(167.5);
    expect(plan.installments).toHaveLength(6);

    // Sum of all 6 installments must equal totalRepaymentZAR
    const sumInstallments = plan.installments.reduce(
      (acc, curr) => acc + curr.amountZAR,
      0,
    );
    expect(Math.round(sumInstallments * 100) / 100).toBe(1005);

    // All installments should be pending initially
    expect(plan.installments.every((i) => i.status === "PENDING")).toBe(true);
    expect(plan.installments[0].installmentNumber).toBe(1);
    expect(plan.installments[5].installmentNumber).toBe(6);
  });

  it("calculates agent shortfall when wallet balance is insufficient", () => {
    const checkoutAmountZAR = 2500;
    const agentWalletBalanceZAR = 500;
    const plan = calculatePayLaterPlan(checkoutAmountZAR, agentWalletBalanceZAR);

    expect(plan.principalZAR).toBe(2000); // 2500 - 500 = 2000
    // 0.5% of 2000 is 10.00
    expect(plan.platformFeeZAR).toBe(10);
    expect(plan.totalRepaymentZAR).toBe(2010);
    expect(plan.installments).toHaveLength(6);
  });

  it("requests autonomous agent credit advance and stores loan with 6 installments", async () => {
    const agentId = "test_buyer_bot_77";
    const ownerAddress = "0x49B0E1F8C2224424B10a82B93E94d1F3238385a4";

    const { loan, success } = await requestAgentPayLaterLoan({
      agentId,
      agentName: "Test Buyer Bot",
      ownerAddress,
      ownerName: "Test Owner",
      storeId: "nike-performance",
      storeName: "Nike Performance",
      itemTitle: "Air Zoom Pegasus",
      principalZAR: 1200,
    });

    expect(success).toBe(true);
    expect(loan.id).toMatch(/^LOAN-PAYLATER-/);
    expect(loan.tenureMonths).toBe(6);
    expect(loan.platformFeePercent).toBe(0.5);
    expect(loan.platformFeeZAR).toBe(6); // 0.5% of 1200
    expect(loan.totalRepaymentZAR).toBe(1206);
    expect(loan.remainingBalanceZAR).toBe(1206);
    expect(loan.status).toBe("ACTIVE_REPAYMENT");
    expect(loan.installments).toHaveLength(6);

    const stored = getStoredPayLaterLoans(ownerAddress);
    expect(stored.some((l) => l.id === loan.id)).toBe(true);
  });

  it("records installment repayment and updates remaining balance", async () => {
    const { loan } = await requestAgentPayLaterLoan({
      agentId: "test_bot_repay",
      agentName: "Repay Bot",
      ownerAddress: "0x1111111111111111111111111111111111111111",
      ownerName: "Alice",
      storeId: "store-1",
      storeName: "Store 1",
      itemTitle: "Item 1",
      principalZAR: 600,
    });

    // Repay installment 1
    const { loan: updated, repaidInstallment, success } = await repayAgentPayLaterInstallment(loan.id, 1);
    expect(success).toBe(true);
    expect(repaidInstallment.status).toBe("PAID");
    expect(repaidInstallment.paidAt).toBeDefined();
    expect(updated.installments[0].status).toBe("PAID");
    expect(updated.remainingBalanceZAR).toBeLessThan(loan.totalRepaymentZAR);
    expect(updated.status).toBe("ACTIVE_REPAYMENT");
  });

  it("routes /api/paypal/pay-later/plan and /api/paypal/pay-later/loans via API router", async () => {
    // 1. Calculate plan endpoint
    const planRes = await handleApiRoute(
      new Request("https://autocom.dev/api/paypal/pay-later/plan?amount=1200&balance=200"),
    );
    expect(planRes.status).toBe(200);
    const planData = await planRes.json();
    expect(planData.plan.principalZAR).toBe(1000);
    expect(planData.plan.platformFeeZAR).toBe(5);
    expect(planData.plan.tenureMonths).toBe(6);

    // 2. Loans list endpoint
    const loansRes = await handleApiRoute(
      new Request("https://autocom.dev/api/paypal/pay-later/loans?agentId=test_buyer_bot_77"),
    );
    expect(loansRes.status).toBe(200);
    const loansData = await loansRes.json();
    expect(Array.isArray(loansData.loans)).toBe(true);
  });

  it("exposes Pay Later tools in PAYPAL_AGENT_TOOLS and executes via MCP", async () => {
    const toolNames = PAYPAL_AGENT_TOOLS.map((t) => t.name);
    expect(toolNames).toContain("paypal_pay_later_calculate_plan");
    expect(toolNames).toContain("paypal_pay_later_apply");

    // Execute paypal_pay_later_calculate_plan
    const calcResult = await executePayPalAgentTool(
      "paypal_pay_later_calculate_plan",
      { amountZAR: 1000, agentWalletBalanceZAR: 200 },
    );
    expect(calcResult.success).toBe(true);
    expect(calcResult.result.plan.tenureMonths).toBe(6);
    expect(calcResult.result.plan.platformFeePercent).toBe(0.5);

    // Execute paypal_pay_later_apply
    const applyResult = await executePayPalAgentTool("paypal_pay_later_apply", {
      agentId: "mcp_agent_test",
      agentName: "MCP Agent",
      ownerAddress: "0x2222222222222222222222222222222222222222",
      ownerName: "Bob",
      checkoutAmountZAR: 800,
      agentWalletBalanceZAR: 300,
      storeName: "Test Merchant",
      itemName: "Test Goods",
    });
    expect(applyResult.success).toBe(true);
    expect(applyResult.result.loan.tenureMonths).toBe(6);
    expect(applyResult.result.loan.platformFeePercent).toBe(0.5);
    expect(applyResult.result.loan.principalZAR).toBe(500);
  });
});
