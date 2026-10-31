"use client";

import React, { useState } from "react";
import { Guest } from "@/lib/domain";
import { Listing } from "@/components/ui/Listing";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export interface GuestListingRowProps {
  guest: Guest;
  dietaryOptions: string[];
  onUpdateGuest: (updated: Guest) => void;
  onDeleteGuest: (id: string) => void;
}

export const GuestListingRow: React.FC<GuestListingRowProps> = ({
  guest,
  dietaryOptions,
  onUpdateGuest,
  onDeleteGuest,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(guest.name);
  const [editGroup, setEditGroup] = useState(guest.group);
  const [editDietary, setEditDietary] = useState(guest.dietary || "none");
  const [editPlusOnes, setEditPlusOnes] = useState(guest.plusOnes);

  const handleSave = () => {
    onUpdateGuest({
      ...guest,
      name: editName.trim() || guest.name,
      group: editGroup.trim() || guest.group,
      dietary: editDietary === "none" ? undefined : editDietary,
      plusOnes: Math.max(0, Math.min(5, editPlusOnes)),
    });
    setIsEditing(false);
  };

  const handleRsvpChange = (newRsvp: "pending" | "yes" | "no") => {
    onUpdateGuest({
      ...guest,
      rsvp: newRsvp,
    });
  };

  const rsvpBadge = (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        fontSize: "0.8rem",
        fontWeight: "bold",
        textTransform: "uppercase",
        border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
        backgroundColor:
          guest.rsvp === "yes"
            ? "var(--dp-color-ink)"
            : "transparent",
        color:
          guest.rsvp === "yes"
            ? "var(--dp-color-canvas)"
            : "var(--dp-color-ink)",
      }}
    >
      {guest.rsvp}
    </span>
  );

  return (
    <div style={{ marginBottom: "var(--dp-space-sm)" }}>
      <Listing
        identity={
          <div>
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  aria-label="Edit guest name"
                  style={{
                    padding: "4px 8px",
                    border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                    fontSize: "0.95rem",
                  }}
                />
                <input
                  type="text"
                  value={editGroup}
                  onChange={(e) => setEditGroup(e.target.value)}
                  aria-label="Edit guest group"
                  placeholder="Group"
                  style={{
                    padding: "4px 8px",
                    border: "var(--dp-border-hairline) solid var(--dp-color-rule)",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            ) : (
              <div>
                <strong style={{ fontSize: "1.05rem", display: "block" }}>
                  {guest.name}
                </strong>
                <span className="text-label" style={{ color: "var(--dp-color-secondary)" }}>
                  Group: {guest.group}
                </span>
              </div>
            )}
          </div>
        }
        terms={
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Select
                id={`guest-rsvp-${guest.id}`}
                label="RSVP Status"
                value={guest.rsvp}
                onChange={(e) => handleRsvpChange(e.target.value as "pending" | "yes" | "no")}
                aria-label={`RSVP status for ${guest.name}`}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "yes", label: "Yes (Confirmed)" },
                  { value: "no", label: "No (Declined)" },
                ]}
              />
              {rsvpBadge}
            </div>

            {isEditing ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label className="text-label">
                  Plus-ones:
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={editPlusOnes}
                    onChange={(e) => setEditPlusOnes(parseInt(e.target.value, 10) || 0)}
                    style={{ width: "50px", marginLeft: "4px", padding: "2px" }}
                  />
                </label>
              </div>
            ) : (
              <span className="text-label" style={{ color: "var(--dp-color-secondary)" }}>
                Plus-ones: {guest.plusOnes} (Seats: {1 + guest.plusOnes})
              </span>
            )}
          </div>
        }
        details={
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "space-between" }}>
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Select
                  id={`guest-dietary-${guest.id}`}
                  label="Dietary"
                  value={editDietary}
                  onChange={(e) => setEditDietary(e.target.value)}
                  options={[
                    { value: "none", label: "None / Standard" },
                    ...dietaryOptions.map((opt) => ({ value: opt, label: opt })),
                  ]}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <Button variant="default" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-label" style={{ display: "block" }}>
                  Diet: {guest.dietary || "Standard / None"}
                </span>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => onDeleteGuest(guest.id)}
                    aria-label={`Delete ${guest.name}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};
