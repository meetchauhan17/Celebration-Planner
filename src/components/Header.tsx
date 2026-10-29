import React from "react";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon" aria-hidden="true">
            ✦
          </div>
          <span className="brand-title">Celebration Planner</span>
        </div>
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a href="#overview" className="nav-link">
                Overview
              </a>
            </li>
            <li>
              <a href="#features" className="nav-link">
                Features
              </a>
            </li>
            <li>
              <a href="#get-started" className="nav-link">
                Get Started
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
