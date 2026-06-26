import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Frontend Documentacion PineApple",
    pageTitleSuffix: "",
    enableSPA: false,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "pineapple-mikael-engineer.github.io",
    ignorePatterns: ["private", "templates", ".obsidian", "_private"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        // Catppuccin Mocha — misma paleta del vault Frontend_Obsidian
        // (snippet `frontend-inmersion.css`). El sitio es dark-only: ambos
        // modos comparten la paleta oscura, por eso un visitante en tema claro
        // ve exactamente lo mismo (el toggle de dark mode se oculta por CSS).
        lightMode: {
          light: "#1e1e2e", // base — fondo de pagina
          lightgray: "#313244", // surface0 — bordes / hr
          gray: "#7f849c", // overlay1 — texto tenue, lineas del grafo
          darkgray: "#bac2de", // subtext1 — texto del cuerpo
          dark: "#cdd6f4", // text — titulos, iconos, negritas
          secondary: "#cba6f7", // mauve — enlaces, nodo activo (acento)
          tertiary: "#b4befe", // lavender — hover, nodos visitados
          highlight: "rgba(180, 190, 254, 0.15)", // lavender — fondo enlaces internos / code
          textHighlight: "#f9e2af88", // yellow — resaltado ==texto==
        },
        darkMode: {
          light: "#1e1e2e",
          lightgray: "#313244",
          gray: "#7f849c",
          darkgray: "#bac2de",
          dark: "#cdd6f4",
          secondary: "#cba6f7",
          tertiary: "#b4befe",
          highlight: "rgba(180, 190, 254, 0.15)",
          textHighlight: "#f9e2af88",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        // Catppuccin Mocha en ambos temas: el codigo se ve siempre Mocha,
        // igual que en el vault. El fondo lo pone custom.scss (--fi-crust).
        theme: {
          light: "catppuccin-mocha",
          dark: "catppuccin-mocha",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
