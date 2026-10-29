import React from "react";
import { Header, FeatureCard, BudgetSummaryCard } from "@/components";
import { calculateBudgetSummary } from "@/lib/engine";

export default function Home() {
  const sampleSummary = calculateBudgetSummary(15000, [
    {
      id: "b1",
      category: "Venue",
      title: "Main Ballroom Deposit",
      allocatedAmount: 6000,
      actualAmount: 5800,
      isPaid: true,
    },
    {
      id: "b2",
      category: "Catering",
      title: "Three-course Dinner Service",
      allocatedAmount: 4500,
      actualAmount: 4200,
      isPaid: true,
    },
    {
      id: "b3",
      category: "Entertainment",
      title: "Live Band & DJ Setup",
      allocatedAmount: 2000,
      actualAmount: 2000,
      isPaid: false,
    },
    {
      id: "b4",
      category: "Decor & Lighting",
      title: "Floral Centerpieces & Ambient Wash",
      allocatedAmount: 1500,
      actualAmount: 1400,
      isPaid: false,
    },
  ]);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="container">
        <section id="overview" className="hero-section">
          <div className="hero-badge">Smart Event Coordination</div>
          <h1 className="hero-title">
            Seamless Planning for <span className="grad-text">Unforgettable Celebrations</span>
          </h1>
          <p className="hero-subtitle">
            Organize budgets, track vendor workflows, automate timelines, and generate intelligent recommendations
            for any milestone occasion.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "3rem" }}>
            <a href="#features" className="btn btn-primary">
              Explore Capabilities
            </a>
            <a href="#overview" className="btn btn-secondary">
              View Sample Plan
            </a>
          </div>
        </section>

        <section aria-label="Sample Plan Budget Overview">
          <BudgetSummaryCard summary={sampleSummary} />
        </section>

        <section id="features" style={{ padding: "2rem 0" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Core Planning Capabilities
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Engineered with pure domain models, local storage continuity, and AI-assisted workflows.
            </p>
          </div>

          <div className="cards-grid">
            <FeatureCard
              icon="💰"
              accentColor="purple"
              title="Budget Optimization"
              description="Real-time category breakdown, cost-variance alerts, and industry-standard benchmark allocation models."
            />
            <FeatureCard
              icon="📅"
              accentColor="indigo"
              title="Timeline Sequencing"
              description="Phase-based milestone generator and completion tracking backward-scheduled from your event date."
            />
            <FeatureCard
              icon="🤝"
              accentColor="emerald"
              title="Vendor Coordination"
              description="Track outreach stages, quote comparisons, contracts, and payment schedules in a structured directory."
            />
            <FeatureCard
              icon="⚡"
              accentColor="amber"
              title="AI Planning Engine"
              description="Server-side Groq integration to brainstorm customized celebration themes, schedules, and decor ideas."
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>Celebration & Event Planning Assistant · Built with Next.js App Router & TypeScript</p>
        </div>
      </footer>
    </div>
  );
}
