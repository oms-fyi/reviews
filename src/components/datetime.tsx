"use client";

import { ComponentProps } from "react";

interface TimeProps extends Omit<ComponentProps<"time">, "children"> {
  opts: Intl.DateTimeFormatOptions;
}

export const Time = ({ opts, dateTime, ...props }: TimeProps) => (
  <time dateTime={dateTime} {...props}>
    {new Intl.DateTimeFormat(undefined, opts).format(
      typeof dateTime === "string" ? new Date(dateTime) : undefined,
    )}
  </time>
);
