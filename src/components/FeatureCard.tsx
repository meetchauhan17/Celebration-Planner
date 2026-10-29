import React from "react";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  accentColor?: "purple" | "emerald" | "indigo" | "amber";
}

export function FeatureCard({
  title,
  description,
  icon,
  accentColor = "purple",
}: FeatureCardProps) {
  return (
    <article className="feature-card">
      <div className={`card-icon ${accentColor}`} aria-hidden="true">
        {icon}
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>
    </article>
  );
}
