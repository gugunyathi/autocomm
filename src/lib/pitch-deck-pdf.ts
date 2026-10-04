import { jsPDF } from "jspdf";

export interface PitchDeckSlide {
  title: string;
  subtitle: string;
  category: string;
  bullets: string[];
  metrics?: { label: string; value: string; desc?: string }[];
  highlight?: string;
  footerNote?: string;
}

export const PITCH_DECK_SLIDES: PitchDeckSlide[] = [
  {
    category: "COVER / VISION",
    title: "AutoCom | Autonomous Spatial Commerce",
    subtitle: "The 24/7 Agent-to-Agent Micro-Deals Protocol for Physical Retail & Commuter Traffic",
    bullets: [
      "Executive Vision: We turn physical foot traffic and 50m commuter drive-by flow into instant, automated algorithmic retail sales with autonomous shopping agents.",
      "Consumers: Never miss any brand specials or promotions again — let your personal AI agent negotiate +50% discounts for everything you love, pass by, or never walk into.",
      "Merchants: An agentic salesman that never sleeps. Push dynamic pricing and promos to foot and drive-by traffic 24/7/365, dynamically adjusting to daily sales targets.",
      "Brands: Users never miss promotional adverts as our spatial network converts billboard and digital impressions directly into closed, in-store sales 24/7.",
    ],
    highlight: "Autonomous Agent-to-Agent Commerce Core · Ribbon Protocol Inc.",
    footerNote: "Confidential Investor Presentation · Seed Stage",
  },
  {
    category: "THE PROBLEM",
    title: "Retail Foot Traffic is Lost & Brand Ads Go Unseen",
    subtitle:
      "A $4.8 Trillion disconnect between nearby physical consumers, local merchants, and global brands",
    bullets: [
      "Consumers miss 95%+ of in-store promotions, flash sales, and brand specials simply by walking or driving past without entering.",
      "Manual coupon hunting, loyalty cards, and spammy marketing emails are broken and ignored by modern consumers.",
      "Brands & Advertisers waste $180B+ on desktop Google/Meta ads and outdoor billboards that go unseen and cannot close real-world purchases.",
      "Merchants have zero ability to negotiate in real-time with nearby foot traffic or commuter vehicles passing within 50m of their storefronts.",
    ],
    metrics: [
      { label: "Lost Foot Traffic", value: "94.2%", desc: "Passersby unaware of active discounts" },
      {
        label: "Wasted Brand Ad Spend",
        value: "$180B+",
        desc: "Passive ads with sub-1.5% clickthrough",
      },
      {
        label: "Missed Daily Revenue",
        value: "32%",
        desc: "Due to static, non-responsive pricing",
      },
    ],
  },
  {
    category: "THE SOLUTION",
    title: "Autonomous Spatial Proximity & Agentic Bargaining",
    subtitle:
      "Converting passive brand promotions directly into high-converting retail transactions",
    bullets: [
      "Personal Consumer Agent: Automatically scans nearby physical stores, matches brand preferences, and aggressively negotiates up to 50%+ discounts.",
      "24/7 Merchant Agentic Salesman: Pushes dynamic, inventory-responsive offers to passing foot traffic, 50m commuter drive-by traffic, and connected digital billboards.",
      "Brand Direct-to-Sale Pipeline: Brands push manufacturer promos, product launches, and co-op discounts straight to consumer agents, turning ad impressions into guaranteed sales.",
      "Instant Cryptographic Checkout: WebAuthn biometric passkey authorization generates instant digital QR vouchers for contactless POS redemption.",
    ],
    metrics: [
      { label: "Avg Consumer Savings", value: "35% - 60%", desc: "On curated brand preferences" },
      { label: "Foot Traffic Conversion", value: "28.4%", desc: "Direct walk-in store lift" },
      { label: "Ad-to-Sale Efficiency", value: "12x", desc: "ROI vs passive impression ads" },
    ],
  },
  {
    category: "PRODUCT & TECHNOLOGY",
    title: "Sub-Meter IPS Indoor Mesh & A2A Negotiation Protocol",
    subtitle:
      "Patented hardware sensor integration, brand promo distribution, and cryptographic passkeys",
    bullets: [
      "IPS Indoor Context Engine: Sub-meter precision via hardware gyroscope, digital compass, and architectural passage grid mapping.",
      "A2A Protocol (Muse-ZA & Nibble-ZA): Deterministic budgetary guardrails, cryptographic signed receipts, and automated counter-offering.",
      "Road Network & Billboard Integration: Connects outdoor brand billboards with commuter vehicle agents within 50m to trigger drive-in deal claims.",
      "Zero-Install PWA & WebAuthn: Frictionless onboarding with biometric face/fingerprint authentication and offline-first service worker sync.",
    ],
    highlight:
      "Live Platform v2.6 Active: 8-Outlet Retail Mall Corridor Grid & Real Hardware Compass Sensor Engine",
  },
  {
    category: "MARKET OPPORTUNITY",
    title: "$4.8T Global Retail Commerce & Proximity Media",
    subtitle:
      "Capturing the transition from static advertising to autonomous agent-driven transactions",
    bullets: [
      "TAM ($4.8 Trillion): Total global retail commerce in shopping malls, commercial high streets, and commuter transit hubs.",
      "SAM ($450 Billion): Brand retail media networks, dynamic proximity promotions, and digital out-of-home (DOOH) advertising.",
      "SOM ($42 Billion): Autonomous Agent-to-Agent (A2A) micro-commerce transactions in Tier-1 metro regions.",
      "Macro Tailwinds: AI agent adoption + decline of traditional web banner ads + brand migration to performance-based retail media.",
    ],
    metrics: [
      { label: "TAM", value: "$4.8T", desc: "Global Physical Retail" },
      { label: "SAM", value: "$450B", desc: "Proximity Retail Media" },
      { label: "SOM", value: "$42B", desc: "Autonomous A2A Commerce" },
    ],
  },
  {
    category: "BUSINESS MODEL",
    title: "High-Margin Transaction Take-Rate, Brand Media & SaaS",
    subtitle: "Triple revenue stream aligned with consumer savings and merchant revenue expansion",
    bullets: [
      "Performance Take Rate (2.5% - 4.5%): Fee charged strictly on successful, incremental revenue generated through A2A proximity vouchers.",
      "Brand Performance Ad-to-Sale Fees: National brands pay per closed in-store conversion rather than wasteful cost-per-impression (CPM).",
      "Merchant Agent SaaS ($99 - $899 / month): Tiered monthly subscription for dynamic pricing automation, inventory sync, and billboard network nodes.",
      "High LTV / Ultra-Low CAC: Consumer viral loop through guaranteed savings; zero friction merchant onboarding via standard POS QR scanning.",
    ],
    metrics: [
      { label: "Take Rate", value: "3.5%", desc: "Avg take rate on GMV" },
      { label: "Merchant SaaS", value: "$299/mo", desc: "Avg recurring revenue / store" },
      { label: "Gross Margin", value: "88%", desc: "Pure software & protocol model" },
    ],
  },
  {
    category: "COMPETITIVE ADVANTAGE",
    title: "Why AutoCom Beats Google Ads, Meta Ads & Billboards",
    subtitle: "The shift from passive click models to guaranteed autonomous spatial conversion",
    bullets: [
      "Google & Meta Ads: Passive, ungrounded, desktop-bound, click-fraud vulnerable, zero negotiation, and negative ROI for physical brands and retailers.",
      "AutoCom A2A Protocol: 100% spatial proximity (sub-meter corridor + 50m commuter), real-time intent match, automated algorithmic negotiation, and guaranteed foot traffic conversion.",
      "Traditional Outdoor Billboards: Static, non-interactive, untrackable. AutoCom turns billboards into instant transactional beacon nodes.",
      "Our Moat: Patented IPS corridor grid algorithms + bidirectional agentic negotiation engine + decentralized biometric passkey architecture.",
    ],
    highlight:
      "Google/Meta sell ad impressions. AutoCom delivers closed transactions directly into retail stores.",
  },
  {
    category: "TRACTION & ROADMAP",
    title: "Proven Architecture & Rapid Commercial Scale",
    subtitle: "From prototype validation to nationwide retail deployment",
    bullets: [
      "Phase 1 (Completed): Live spatial engine v2.6, IPS corridor mall simulation, 8 retail partner archetypes (Zara, Woolworths, iStore, Nike, Clicks, H&M, Books, Mugg & Bean).",
      "Phase 2 (Q3-Q4): Pilot deployment across 15 flagship shopping centers (Johannesburg, Cape Town, Nairobi) targeting 150,000 active consumer agents.",
      "Phase 3 (Next Year): Expansion into outdoor billboard road network integration and Tier-1 European / North American transit hubs.",
      "Phase 4: Open Developer SDK for third-party merchant agent plugins and multi-brand loyalty federation.",
    ],
    metrics: [
      { label: "Current Alpha", value: "v2.6 Live", desc: "Interactive Spatial Engine" },
      { label: "Target GMV (18m)", value: "$45M+", desc: "Projected 18-month volume" },
      { label: "Active Agents (18m)", value: "500,000", desc: "Target consumer base" },
    ],
  },
  {
    category: "LEADERSHIP TEAM",
    title: "Experienced Founders in Tech, Retail & Spatial Protocols",
    subtitle: "Built to execute the next standard of autonomous commerce",
    bullets: [
      "Gugu Nyathi — Chief Executive Officer (CEO)",
      "LinkedIn: https://www.linkedin.com/in/gugunyathi/",
      "Background: Visionary product architect, spatial computing protocols, AI agent systems & decentralized commerce pioneer.",
      "Thami Nyathi — Chief Operating Officer (COO)",
      "LinkedIn: https://www.linkedin.com/in/thaminyathi/",
      "Background: Retail commercial partnerships, brand campaign networks, supply chain operations & rapid go-to-market scaling.",
    ],
    highlight:
      "Complementary founder DNA combining frontier AI agent architecture with enterprise retail execution.",
  },
  {
    category: "THE ASK & MILESTONES",
    title: "Raising $1.5M Seed Round",
    subtitle: "Accelerating engineering, brand ad network deployment & market expansion",
    bullets: [
      "50% Protocol & Agent Engineering: Scaling low-latency A2A negotiation algorithms, outdoor billboard API nodes, and spatial SDKs.",
      "30% Brand & Merchant Partnerships: Onboarding top 50 national retail chains, FMCG brand advertisers, and transit media operators.",
      "20% Security, Compliance & Operations: WebAuthn cryptographic audits, enterprise POS integrations, and team expansion.",
      "18-Month Target: $45M Annualized GMV, 2,500 Connected Retail Locations, 500k Active Autonomous Consumer Agents.",
    ],
    highlight:
      "Join us in defining the autonomous agentic spatial commerce layer for the physical world.",
    footerNote: "Contact: gugu@ribbonprotocol.org · https://www.linkedin.com/in/gugunyathi/",
  },
];

/**
 * Generates and triggers instant browser download of the high-res, multi-page Pitch Deck PDF
 */
export async function downloadPitchDeckPDF(): Promise<void> {
  // Create 16:9 Landscape Pitch Deck PDF (297mm x 167mm or A4 Landscape: 297mm x 210mm)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  const PRIMARY_COLOR = [13, 148, 136]; // Teal #0d9488
  const ACCENT_COLOR = [245, 158, 11]; // Amber #f59e0b
  const BG_COLOR = [9, 14, 26]; // Dark slate #090e1a
  const CARD_BG = [18, 26, 44]; // Deep blue card #121a2c
  const TEXT_WHITE = [255, 255, 255];
  const TEXT_MUTED = [148, 163, 184]; // Slate 400

  PITCH_DECK_SLIDES.forEach((slide, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // 1. Background Fill
    doc.setFillColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Decorative gradient/lines
    doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.setLineWidth(1.2);
    doc.line(16, 14, pageWidth - 16, 14);

    // 2. Header Bar
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text(slide.category.toUpperCase(), 16, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(
      `AUTOCOM · PITCH DECK | SLIDE ${index + 1} OF ${PITCH_DECK_SLIDES.length}`,
      pageWidth - 16,
      10,
      {
        align: "right",
      },
    );

    // 3. Slide Title & Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(TEXT_WHITE[0], TEXT_WHITE[1], TEXT_WHITE[2]);
    doc.text(slide.title, 16, 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
    doc.text(slide.subtitle, 16, 33);

    // 4. Main Body: Bullets inside left-side container
    const hasMetrics = Boolean(slide.metrics && slide.metrics.length > 0);
    const contentWidth = hasMetrics ? 165 : pageWidth - 32;

    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    doc.roundedRect(16, 40, contentWidth, 138, 4, 4, "F");

    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.roundedRect(16, 40, contentWidth, 138, 4, 4, "S");

    let currentY = 50;
    slide.bullets.forEach((bullet) => {
      // Check if team member or special header
      const isTeamName = bullet.startsWith("Gugu Nyathi") || bullet.startsWith("Thami Nyathi");
      const isLinkedIn = bullet.startsWith("LinkedIn:");

      if (isTeamName) {
        currentY += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
        doc.text(`★ ${bullet}`, 22, currentY);
        currentY += 6;
      } else if (isLinkedIn) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.text(`🔗 ${bullet}`, 25, currentY);
        currentY += 6;
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.text("•", 22, currentY);

        // Check if prefix like "Consumers:", "24/7 Merchant Agentic Salesman:", "Brand Direct-to-Sale Pipeline:", "Instant Cryptographic Checkout:"
        const colonIndex = bullet.indexOf(":");
        if (colonIndex > 0 && colonIndex <= 42) {
          const prefix = bullet.substring(0, colonIndex + 1);
          const rest = bullet.substring(colonIndex + 1);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
          const prefixWidth = doc.getTextWidth(`${prefix} `);
          doc.text(prefix, 27, currentY);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(TEXT_WHITE[0], TEXT_WHITE[1], TEXT_WHITE[2]);

          const splitText = doc.splitTextToSize(rest.trim(), contentWidth - 27 - prefixWidth);
          if (splitText.length > 0 && prefixWidth < contentWidth - 50) {
            doc.text(splitText[0], 27 + prefixWidth, currentY);
            if (splitText.length > 1) {
              const remainingLines = splitText.slice(1);
              currentY += 5;
              doc.text(remainingLines, 27, currentY);
              currentY += (remainingLines.length - 1) * 5;
            }
            currentY += 7.5;
          } else {
            currentY += 5;
            const fullRestSplit = doc.splitTextToSize(rest.trim(), contentWidth - 27);
            doc.text(fullRestSplit, 27, currentY);
            currentY += fullRestSplit.length * 5 + 4;
          }
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(TEXT_WHITE[0], TEXT_WHITE[1], TEXT_WHITE[2]);

          const splitText = doc.splitTextToSize(bullet, contentWidth - 20);
          doc.text(splitText, 27, currentY);
          currentY += splitText.length * 4.8 + 3.5;
        }
      }
    });

    // 5. Highlight callout box at bottom of content
    if (slide.highlight) {
      doc.setFillColor(13, 148, 136, 0.18);
      doc.roundedRect(20, 154, contentWidth - 8, 18, 3, 3, "F");
      doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.setLineWidth(0.6);
      doc.roundedRect(20, 154, contentWidth - 8, 18, 3, 3, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.8);
      doc.setTextColor(TEXT_WHITE[0], TEXT_WHITE[1], TEXT_WHITE[2]);
      const splitHighlight = doc.splitTextToSize(
        `⚡ KEY TAKEAWAY: ${slide.highlight}`,
        contentWidth - 16,
      );
      doc.text(splitHighlight, 24, 161);
    }

    // 6. Right Side Metrics Cards (if present)
    if (hasMetrics && slide.metrics) {
      const metricX = 188;
      const metricWidth = pageWidth - metricX - 16;
      const cardHeight = 42;

      slide.metrics.forEach((m, mIdx) => {
        const cardY = 40 + mIdx * (cardHeight + 6);

        doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
        doc.roundedRect(metricX, cardY, metricWidth, cardHeight, 4, 4, "F");

        doc.setDrawColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
        doc.setLineWidth(0.6);
        doc.roundedRect(metricX, cardY, metricWidth, cardHeight, 4, 4, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
        doc.text(m.label.toUpperCase(), metricX + 8, cardY + 11);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2]);
        doc.text(m.value, metricX + 8, cardY + 23);

        if (m.desc) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(TEXT_WHITE[0], TEXT_WHITE[1], TEXT_WHITE[2]);
          const splitDesc = doc.splitTextToSize(m.desc, metricWidth - 14);
          doc.text(splitDesc, metricX + 8, cardY + 31);
        }
      });
    }

    // 7. Footer
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(16, pageHeight - 16, pageWidth - 16, pageHeight - 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    const footer = slide.footerNote || "AutoCom · Autonomous Spatial Commerce · Confidential";
    doc.text(footer, 16, pageHeight - 9);

    doc.text("INVESTOR PITCH DECK · SEED STAGE", pageWidth - 16, pageHeight - 9, {
      align: "right",
    });
  });

  // Save / Trigger Download
  doc.save("AutoCom_Pitch_Deck.pdf");
}
