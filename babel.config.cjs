/**
 * Transforms `import.meta.env` → `({ env: process.env })` so Jest can
 * resolve Vite-style environment variables (e.g. VITE_API_URL) during tests.
 * The plugin is scoped to the "test" env so it never runs inside Vite builds.
 */
function importMetaEnvPlugin() {
  return {
    visitor: {
      MetaProperty(path) {
        if (
          path.node.meta.name === 'import' &&
          path.node.property.name === 'meta'
        ) {
          path.replaceWithSourceString('({ env: process.env })');
        }
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
  env: {
    test: {
      plugins: [importMetaEnvPlugin],
    },
  },
};
