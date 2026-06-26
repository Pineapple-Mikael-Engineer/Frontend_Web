import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileTrieNode } from "./quartz/util/fileTrie"

// Recorta el nombre que muestra el Explorer (arbol lateral) en el primer
// separador de guion rodeado de espacios: em-dash "—", en-dash "–" o guion "-".
// Asi "np.reshape — Cambiar forma del array" se ve como "np.reshape".
// Es PURAMENTE VISUAL: muta node.displayName (un override del trie del Explorer),
// no toca el frontmatter `title`, por lo que el H1, la pestaña, la busqueda,
// los popovers y el og:title siguen mostrando el title completo.
// Si el nombre no tiene separador, split() devuelve el nombre completo intacto,
// asi que carpetas y notas sin " — " quedan igual.
// Nota: esta funcion se serializa con .toString() y se ejecuta en el navegador,
// por eso es autocontenida (no referencia nada externo).
const explorerTrimDash = (node: FileTrieNode) => {
  node.displayName = node.displayName.split(/\s[—–-]\s/)[0].trim()
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({ mapFn: explorerTrimDash }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ mapFn: explorerTrimDash }),
  ],
  right: [],
}
