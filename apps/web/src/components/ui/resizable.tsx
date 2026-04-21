"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";

import { cn } from "./utils";

// Simple pass-through components that will work with any resizable panel library
export const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: "horizontal" | "vertical";
  }
>(({ className, direction = "horizontal", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full",
        direction === "vertical" && "flex-col",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    order?: number;
    collapsible?: boolean;
    onCollapse?: () => void;
    onExpand?: () => void;
  }
>(
  (
    {
      className,
      style,
      children,
      defaultSize,
      minSize,
      maxSize,
      order,
      collapsible,
      onCollapse,
      onExpand,
      ...props
    },
    ref,
  ) => {
    // Filter out custom props that shouldn't be passed to DOM
    return (
      <div
        ref={ref}
        data-slot="resizable-panel"
        className={cn("flex-1", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ResizablePanel.displayName = "ResizablePanel";

export const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withHandle?: boolean;
  }
>(({ withHandle, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="resizable-handle"
      className={cn(
        "bg-border relative flex w-px items-center justify-center",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </div>
  );
});
ResizableHandle.displayName = "ResizableHandle";
