import React from "react";

export type ColumnsLayout = "equal" | "lead" | "spread";

export interface ColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: ColumnsLayout;
  lead?: boolean;
  leadSplit?: boolean;
  spread?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Columns: React.FC<ColumnsProps> = ({
  layout,
  lead,
  leadSplit,
  spread,
  children,
  className = "",
  ...props
}) => {
  let activeLayout: ColumnsLayout = layout || "equal";
  if (lead || leadSplit) {
    activeLayout = "lead";
  } else if (spread) {
    activeLayout = "spread";
  }

  const layoutClass =
    activeLayout === "lead"
      ? "np-columns-lead"
      : activeLayout === "spread"
        ? "np-columns-spread"
        : "np-columns-equal";

  return (
    <div
      className={`np-columns ${layoutClass} ${className}`.trim()}
      data-layout={activeLayout}
      {...props}
    >
      {children}
    </div>
  );
};

export default Columns;

