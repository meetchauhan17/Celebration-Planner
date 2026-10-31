"use client";

import React from "react";

export interface TimelineFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
}) => {
  return (
    <div className="np-timeline-filters" style={{ margin: "20px 0 16px 0", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
      <div className="np-filter-field" style={{ minWidth: "180px" }}>
        <label
          htmlFor="category-filter-select"
          className="text-label"
          style={{ display: "block", marginBottom: "4px", color: "var(--dp-color-secondary)" }}
        >
          Filter by Category
        </label>
        <select
          id="category-filter-select"
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          className="np-select"
          style={{ width: "100%" }}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="np-filter-field" style={{ minWidth: "160px" }}>
        <label
          htmlFor="status-filter-select"
          className="text-label"
          style={{ display: "block", marginBottom: "4px", color: "var(--dp-color-secondary)" }}
        >
          Filter by Status
        </label>
        <select
          id="status-filter-select"
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          className="np-select"
          style={{ width: "100%" }}
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

export default TimelineFilters;

