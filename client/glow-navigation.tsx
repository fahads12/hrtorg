import * as React from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "next-themes"
import { Venus, Mars, FlaskConical, HeartPulse, BookOpen, Activity } from "lucide-react"
import { MenuBar, type MenuItem } from "@/components/ui/glow-menu"

// Gender items keep unique colors (rose = women, sky = men). Shared items use the muted slate
// so the header reads as one calm row with the two audience chips doing the color work.
const destinations = [
  ["For Women", "Audience.html?g=women", Venus, "text-rose-700", "152,75,120"],
  ["For Men", "Audience.html?g=men", Mars, "text-sky-700", "47,112,154"],
  ["Symptoms", "/symptoms/", Activity, "text-muted-foreground", "70,90,112"],
  ["Lab Testing", "Lab Testing.html", FlaskConical, "text-muted-foreground", "70,90,112"],
  ["Treatments", "Treatments.html", HeartPulse, "text-muted-foreground", "70,90,112"],
  ["Resources", "Resources.html", BookOpen, "text-muted-foreground", "70,90,112"],
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
  if (path.endsWith("/treatments.html") || path.endsWith("/product.html") || path.includes("/hrt-products/") || path.includes("/glp-1/") || path.includes("/menopause/") || path.includes("/low-testosterone/") || path.includes("/thyroid/") || path.includes("/sexual-health/") || path.includes("/hair-loss/") || path.includes("/peptides/") || path.includes("/weight-loss/")) return "Treatments"
  if (path.includes("/symptoms/") || path.includes("/conditions/")) return "Symptoms"
  if (path.endsWith("/resources.html") || path.includes("/health/") || path.includes("/blog-categories/") || path.includes("/quizzes/")) return "Resources"
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
