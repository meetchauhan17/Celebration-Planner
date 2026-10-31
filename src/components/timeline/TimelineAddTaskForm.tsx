"use client";

import React, { useState } from "react";
import { TimelineTask } from "@/lib/domain";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface TimelineAddTaskFormProps {
  onAddTask: (task: TimelineTask) => void;
}

export const TimelineAddTaskForm: React.FC<TimelineAddTaskFormProps> = ({ onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a task title.");
      return;
    }
    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }
    if (!category.trim()) {
      setError("Please specify a category.");
      return;
    }

    const newTask: TimelineTask = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      dueDate,
      category: category.trim(),
      status: "todo",
      isCritical: false, // Custom tasks are saved with isCritical = false
      isCustom: true,
    };

    onAddTask(newTask);
    setTitle("");
    setDueDate("");
    setCategory("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div style={{ margin: "24px 0" }}>
        <Button variant="default" onClick={() => setIsOpen(true)} type="button">
          + Add custom milestone
        </Button>
      </div>
    );
  }

  return (
    <div
      className="np-add-task-container"
      style={{
        margin: "24px 0",
        padding: "20px",
        border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
        backgroundColor: "var(--dp-color-ground)",
      }}
    >
      <SectionLabel>Custom Item</SectionLabel>
      <h3
        style={{
          fontFamily: "var(--dp-typography-display)",
          fontSize: "1.3rem",
          fontWeight: "var(--dp-typography-display-weight)",
          margin: "4px 0 16px 0",
        }}
      >
        Add a Custom Milestone
      </h3>

      {error && (
        <div
          role="alert"
          style={{
            color: "var(--dp-color-accent)",
            fontWeight: "var(--dp-typography-label-weight)",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", maxWidth: "600px" }}>
        <div>
          <label
            htmlFor="new-task-title"
            className="text-label"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Milestone Title
          </label>
          <input
            id="new-task-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="np-field-input"
            style={{ width: "100%", padding: "8px" }}
            placeholder="e.g. Schedule family trial lunch"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label
              htmlFor="new-task-date"
              className="text-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Target Due Date
            </label>
            <input
              id="new-task-date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="np-field-input"
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label
              htmlFor="new-task-category"
              className="text-label"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Category
            </label>
            <input
              id="new-task-category"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="np-field-input"
              style={{ width: "100%", padding: "8px" }}
              placeholder="e.g. Hospitality, Attire, Logistics"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <Button variant="default" type="submit">
            Save Milestone
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)} type="button">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TimelineAddTaskForm;

