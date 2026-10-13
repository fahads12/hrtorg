"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps, type Transition, type Variants } from "framer-motion"
import { useTheme } from "next-themes"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MenuItem {
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  label: string
  href: string
  gradient: string
  iconColor: string
}

export interface MenuBarProps extends Omit<HTMLMotionProps<"nav">, "children"> {
  items: MenuItem[]
  activeItem?: string
  onItemClick?: (label: string) => void
}

const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants: Variants = {
  rest: { opacity: 0 },
  glow: { opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

const sharedTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
}

function MenuLink({ item, isActive, onItemClick, canHover, reducedMotion }: {
  item: MenuItem
  isActive: boolean
  onItemClick?: (label: string) => void
  canHover: boolean
  reducedMotion: boolean | null
}) {
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)

  const Icon = item.icon
  const highlighted = isActive || hovered || focused
  const flipped = !reducedMotion && canHover && (hovered || focused)
  const faceClass = "glow-menu-face relative z-10 flex min-h-11 items-center gap-2 rounded-xl bg-transparent px-4 py-2 transition-colors"

  return (
    <li className="relative">
      <motion.a
        href={item.href}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "glow-menu-link relative block rounded-xl outline-offset-4",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
        )}
        style={{ perspective: "600px" }}
        initial="initial"
        animate={flipped ? "hover" : "initial"}
        onHoverStart={() => { if (canHover) setHovered(true) }}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={event => {
          // Retain native navigation and modified-click behavior.
          if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            onItemClick?.(item.label)
          }
        }}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          variants={reducedMotion ? undefined : glowVariants}
          animate={reducedMotion ? { opacity: highlighted ? 1 : 0, scale: 1 } : highlighted ? "hover" : "initial"}
          transition={reducedMotion ? { duration: 0 } : undefined}
          style={{ background: item.gradient }}
        />
        <motion.span
          aria-hidden="true"
          className={faceClass}
          variants={itemVariants}
          transition={reducedMotion ? { duration: 0 } : sharedTransition}
          style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom", backfaceVisibility: "hidden" }}
        >
          <span className={cn("glow-menu-icon transition-colors duration-300", item.iconColor)}><Icon className="h-5 w-5" /></span>
          <span>{item.label}</span>
        </motion.span>
        <motion.span
          aria-hidden="true"
          className={cn(faceClass, "glow-menu-back pointer-events-none absolute inset-0")}
          variants={backVariants}
          transition={reducedMotion ? { duration: 0 } : sharedTransition}
          style={{ transformStyle: "preserve-3d", transformOrigin: "center top", backfaceVisibility: "hidden" }}
        >
          <span className={cn("glow-menu-icon transition-colors duration-300", item.iconColor)}><Icon className="h-5 w-5" /></span>
          <span>{item.label}</span>
        </motion.span>
      </motion.a>
    </li>
  )
}

export const MenuBar = React.forwardRef<HTMLElement, MenuBarProps>(
  ({ className, items, activeItem, onItemClick, ...props }, ref) => {
    const { resolvedTheme } = useTheme()
    const reducedMotion = useReducedMotion()
    const [canHover, setCanHover] = React.useState(false)
    const isDarkTheme = resolvedTheme === "dark"

    React.useEffect(() => {
      const query = window.matchMedia("(hover: hover) and (pointer: fine)")
      const update = () => setCanHover(query.matches)
      update()
      query.addEventListener("change", update)
      return () => query.removeEventListener("change", update)
    }, [])

    return (
      <motion.nav
        ref={ref}
        className={cn("glow-menu relative rounded-2xl border border-border/40 bg-gradient-to-b from-background/80 to-background/40 p-2 shadow-lg backdrop-blur-lg", className)}
        data-theme={isDarkTheme ? "dark" : "light"}
        aria-label="Main navigation"
        initial="rest"
        whileHover={reducedMotion ? undefined : "glow"}
        {...props}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          variants={navGlowVariants}
          style={{ background: isDarkTheme
            ? "radial-gradient(ellipse at center, rgba(96,165,250,.16), rgba(192,132,252,.12) 55%, transparent 85%)"
            : "radial-gradient(ellipse at center, rgba(96,165,250,.10), rgba(192,132,252,.07) 55%, transparent 85%)" }}
        />
        <ul className="glow-menu-list relative z-10 m-0 flex list-none items-center gap-2 p-0">
          {items.map(item => <MenuLink key={item.label} item={item} isActive={item.label === activeItem} onItemClick={onItemClick} canHover={canHover} reducedMotion={reducedMotion} />)}
        </ul>
      </motion.nav>
    )
  },
)

MenuBar.displayName = "MenuBar"
