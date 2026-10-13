// Apply to every generated page so nested routes and static pages share the UI.
module.exports = function integrateGlowMenu(html) {
  if (!html.includes('id="site-navigation"')) return html;
  html = html.replace(/(<nav\b[^>]*id="site-navigation"[^>]*>)([\s\S]*?)(<\/nav>)/, (all, open, content, close) => {
    const primary = new Set(['Audience.html?g=women', 'Audience.html?g=men', 'Lab Testing.html', 'Treatments.html', 'How It Works.html', 'Resources.html']);
    content = content.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>/g, (anchor, before, href, after) => {
      if (!primary.has(href) || anchor.includes('data-glow-fallback')) return anchor;
      return `<a${before}href="${href}"${after} data-glow-fallback>`;
    });
    if (!content.includes('id="hrt-glow-navigation"')) content = '<div id="hrt-glow-navigation" class="hrt-ui"></div>' + content;
    return open + content + close;
  });
  if (!html.includes('assets/glow-menu.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/glow-menu.css"></head>');
  let scripts = '';
  for (const asset of ['react.production.min.js', 'react-dom.production.min.js', 'glow-navigation.js']) {
    if (!html.includes(`assets/${asset}`)) scripts += `<script src="assets/${asset}" defer></script>`;
  }
  if (scripts) html = html.replace('</body>', scripts + '</body>');
  return html;
};
