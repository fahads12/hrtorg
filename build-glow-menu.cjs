// Build the TypeScript UI as a small React island in the existing static site.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const postcss = require('postcss');
const esbuild = require('esbuild');

async function build() {
  fs.mkdirSync('assets', { recursive: true });
  const cliPackage = require.resolve('@tailwindcss/cli/package.json');
  const cli = path.resolve(path.dirname(cliPackage), require(cliPackage).bin.tailwindcss);
  const rawCss = execFileSync(process.execPath, [cli, '-i', 'styles/ui.css', '--minify'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  const css = postcss.parse(rawCss);
  css.walkRules(rule => {
    // A nested rule already inherits its parent's scope. Never scope keyframes.
    let parent = rule.parent;
    while (parent) {
      if (parent.type === 'rule' || (parent.type === 'atrule' && /keyframes$/.test(parent.name))) return;
      parent = parent.parent;
    }
    rule.selectors = rule.selectors.map(selector => {
      if (selector.includes('.hrt-ui') || selector.includes('#hrt-glow-navigation') || selector.includes('#site-navigation')) return selector;
      if (selector === ':root' || selector === ':host') return '.hrt-ui';
      return '.hrt-ui ' + selector;
    });
  });
  // The existing site uses unlayered styles. Unwrap these scoped layers so its
  // global reset cannot override the new component's own spacing.
  css.walkAtRules('layer', layer => {
    if (layer.nodes) layer.replaceWith(...layer.nodes);
    else layer.remove();
  });
  fs.writeFileSync('assets/glow-menu.css', css.toString());

  await esbuild.build({
    entryPoints: ['client/glow-navigation.tsx'], outfile: 'assets/glow-navigation.js',
    bundle: true, minify: true, format: 'iife', target: ['es2020'],
    jsx: 'transform', tsconfig: 'tsconfig.json', legalComments: 'linked',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{
      name: 'existing-react',
      setup(build) {
        build.onResolve({ filter: /^react(?:-dom)?(?:\/.*)?$/ }, args => ({ path: args.path, namespace: 'existing-react' }));
        build.onLoad({ filter: /.*/, namespace: 'existing-react' }, args => {
          if (args.path.includes('jsx-runtime')) return { contents: `var R=window.React;exports.Fragment=R.Fragment;exports.jsx=exports.jsxs=function(type,props,key){return R.createElement(type,key===undefined?props:Object.assign({},props,{key:key}));};` };
          return { contents: `module.exports=window.${args.path.startsWith('react-dom') ? 'ReactDOM' : 'React'};` };
        });
      },
    }],
  });
  console.log('Built scoped Tailwind styles and TypeScript glow navigation.');
}

build().catch(error => { console.error(error); process.exitCode = 1; });
