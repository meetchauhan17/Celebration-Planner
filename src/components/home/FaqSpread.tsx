import React from "react";
import Link from "next/link";
import { Columns, SectionLabel, Button, Disclosure } from "@/components/ui";

export const FaqSpread: React.FC = () => {
  return (
    <section aria-labelledby="faq-headline" style={{ marginBottom: "var(--dp-spacing-story)" }}>
      <Columns lead>
        <div>
          <SectionLabel>Questions</SectionLabel>
          <h2 id="faq-headline" style={{ fontSize: "2rem", margin: "8px 0 16px 0" }}>
            Frequently Asked Questions
          </h2>
          <div>
            <Disclosure question="Is my data stored online?">
              No. All event details, budgets, vendor quotes, and guest lists are stored exclusively in your browser&apos;s
              local storage. Your information stays on your device and is never synchronized to an external server.
            </Disclosure>
            <Disclosure question="How are budgets calculated?">
              Budgets are calculated through pure mathematical functions using base category percentages tailored to
              each event type. These percentages adjust proportionally according to your priorities, city tier, and
              venue type, enforcing minimum per-guest catering floors.
            </Disclosure>
            <Disclosure question="Can I change the suggested budget?">
              Yes. The engine provides an initial balanced allocation. You can adjust individual line amounts, enter
              actual vendor quotes, and monitor variances as contracts are finalized.
            </Disclosure>
            <Disclosure question="What does the AI do?">
              The AI generates contextual celebration ideas (theme, menu, decor, activities) and provides concise
              planning guidance. It never accesses private guest names or contact information, only aggregate counts.
            </Disclosure>
            <Disclosure question="Is this professional advice?">
              No. This software provides structured organizational guidance and financial planning baselines. Always
              confirm formal contracts, pricing, and municipal permits with certified vendors and local authorities.
            </Disclosure>
          </div>
        </div>

        <div>
          <div className="np-lead-box">
            <SectionLabel>Get Started</SectionLabel>
            <h3 style={{ fontSize: "1.25rem", margin: "4px 0 0 0" }}>Ready to begin?</h3>
            <p className="text-compact" style={{ color: "var(--dp-color-secondary)", margin: 0 }}>
              Create your celebration brief in two minutes. Receive your customized budget allocation and milestone
              schedule immediately.
            </p>
            <div style={{ marginTop: "6px" }}>
              <Button href="/plan" style={{ width: "100%" }}>
                Plan an event
              </Button>
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/events" className="np-button-link text-compact">
                View saved events
              </Link>
            </div>
          </div>
        </div>
      </Columns>
    </section>
  );
};
