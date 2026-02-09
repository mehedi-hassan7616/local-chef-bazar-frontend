import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" }

const ChartContainer = React.forwardRef(
  ({ id, config, children, className, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    )
  }
)
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config ?? {}).filter(
    ([_, value]) => value?.theme || value?.light || value?.dark
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, value]) => {
    const color = value?.theme || value?.[theme]
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      label,
      labelFormatter,
      labelClassName,
      formatter,
      ...props
    },
    ref
  ) => {
    const tooltipLabel = React.useMemo(() => {
      if (label === undefined || label === null) {
        return null
      }

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(label, payload)}
          </div>
        )
      }

      return <div className={cn("font-medium", labelClassName)}>{label}</div>
    }, [label, labelFormatter, labelClassName, payload])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${item.dataKey}-${index}`
            const itemConfig = item.payload?.config?.[item.dataKey] ?? {}
            const indicatorColor = item.payload?.payload?.fill ?? item.color

            return (
              <div
                key={key}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    <div
                      className={cn(
                        "shrink-0 text-muted-foreground",
                        nestLabel && "w-full"
                      )}
                    >
                      {nestLabel ? (
                        <div className="flex items-center gap-2">
                          {indicator === "dot" && (
                            <div
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor: indicatorColor,
                              }}
                            />
                          )}
                          {indicator === "line" && (
                            <div
                              className="h-0.5 w-4 shrink-0"
                              style={{
                                backgroundColor: indicatorColor,
                              }}
                            />
                          )}
                          <span className={cn("font-medium", labelClassName)}>
                            {labelFormatter
                              ? labelFormatter(label, payload)
                              : label}
                          </span>
                        </div>
                      ) : (
                        <>
                          {indicator === "dot" && (
                            <div
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor: indicatorColor,
                              }}
                            />
                          )}
                          {indicator === "line" && (
                            <div
                              className="h-0.5 w-4 shrink-0"
                              style={{
                                backgroundColor: indicatorColor,
                              }}
                            />
                          )}
                          <span>{item.name}</span>
                        </>
                      )}
                    </div>
                    {item.value && (
                      <span
                        className={cn(
                          "ml-auto font-mono font-medium tabular-nums text-foreground",
                          nestLabel && "ml-0"
                        )}
                      >
                        {typeof item.value === "number"
                          ? item.value.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : item.value}
                      </span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      ...props
    },
    ref
  ) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
        {...props}
      >
        {payload.map((item) => {
          const key = `${item.dataKey}-${item.value}`
          const itemConfig = item.payload?.config?.[item.dataKey] ?? {}

          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {!hideIcon && (
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color ?? "var(--color-chart-1)",
                  }}
                />
              )}
              <span className="text-muted-foreground">{item.value ?? item.dataKey}</span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}

