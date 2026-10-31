"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { SectionLabel } from "../ui/SectionLabel";

export interface DeleteEventDialogProps {
  isOpen: boolean;
  eventName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  isOpen,
  eventName,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
      }
      // Focus cancel button by default to avoid accidental deletion
      cancelBtnRef.current?.focus();
    } else {
      if (dialog.open) {
        if (typeof dialog.close === "function") {
          dialog.close();
        } else {
          dialog.removeAttribute("open");
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="np-dialog"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <div className="np-dialog-inner">
        <SectionLabel>Confirmation</SectionLabel>
        <h2 id="delete-dialog-title" className="np-dialog-title">
          Delete Celebration
        </h2>
        <p id="delete-dialog-desc" className="np-dialog-desc">
          Delete {eventName}? This cannot be undone.
        </p>
        <div className="np-dialog-actions">
          <Button
            ref={cancelBtnRef}
            variant="secondary"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            type="button"
            className="np-button-danger"
          >
            Delete
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default DeleteEventDialog;
