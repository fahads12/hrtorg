import * as React from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "next-themes"
import { Venus, Mars, FlaskConical, HeartPulse, Route, BookOpen } from "lucide-react"
import { MenuBar, type MenuItem } from "@/components/ui/glow-menu"

const destinations = [
  ["For Women", "Audience.html?g=women", Venus, "text-rose-700", "152,75,120"],
  ["For Men", "Audience.html?g=men", Mars, "text-sky-700", "47,112,154"],
  ["Lab Testing", "Lab Testing.html", FlaskConical, "text-teal-700", "49,129,145"],
  ["Treatments", "Treatments.html", HeartPulse, "text-blue-700", "61,105,155"],
  ["How It Works", "How It Works.html", Route, "text-indigo-700", "99,102,160"],
  ["Resources", "Resources.html", BookOpen, "text-violet-700", "131,97,154"],
] as const

const items: MenuItem[] = destinations.map(([label, href, icon, iconColor, rgb]) => ({
  label, href, icon, iconColor,
  gradient: `radial-gradient(ellipse, rgba(${rgb},.18) 0%, rgba(${rgb},.07) 48%, rgba(${rgb},0) 75%)`,
}))

function currentItem(): string | undefined {
  const path = decodeURIComponent(window.location.pathname).toLowerCase()
  const gender = document.body.dataset.gender
  if (path.endsWith("/audience.html")) return gender === "men" ? "For Men" : "For Women"
  if (path.includes("/women/")) return "For Women"
  if (path.includes("/men/")) return "For Men"
  if (path.endsWith("/lab testing.html") || path.includes("/lab-testing/")) return "Lab Testing"
  if (path.endsWith("/treatments.html") || path.endsWith("/product.html") || path.includes("/hrt-products/")) return "Treatments"
  if (path.endsWith("/how it works.html")) return "How It Works"
  if (path.endsWith("/resources.html") || path.includes("/health/") || path.includes("/blog-categories/")) return "Resources"
  return undefined
}

function HeaderMenu({ navigation }: { navigation: HTMLElement }) {
  const [activeItem, setActiveItem] = React.useState(currentItem)

  React.useEffect(() => {
    // Keep the same parent nav node: its existing mobile and audience listeners
    // continue to receive normal bubbled link clicks.
    navigation.querySelectorAll("a[data-glow-fallback]").forEach(link => link.remove())
    navigation.dataset.glowReady = "true"
    const sync = () => setActiveItem(currentItem())
    const observer = new MutationObserver(sync)
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-gender"] })
    window.addEventListener("popstate", sync)
    return () => {
      observer.disconnect()
      window.removeEventListener("popstate", sync)
    }
  }, [navigation])

  return (
    <ThemeProvider attribute="data-ui-theme" forcedTheme="light" enableSystem={false} enableColorScheme={false} storageKey="hrt-ui-theme">
      <MenuBar role="presentation" aria-label={undefined} items={items} activeItem={activeItem} />
    </ThemeProvider>
  )
}

const navigation = document.getElementById("site-navigation")
const mount = document.getElementById("hrt-glow-navigation")
if (navigation && mount) createRoot(mount).render(<HeaderMenu navigation={navigation} />)
