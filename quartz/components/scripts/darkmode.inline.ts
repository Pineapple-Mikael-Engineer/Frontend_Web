const theme = "dark"
document.documentElement.setAttribute("saved-theme", theme)
localStorage.setItem("theme", theme)

// Forzamos el evento para que componentes como el Graph View se enteren del color
document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }))
