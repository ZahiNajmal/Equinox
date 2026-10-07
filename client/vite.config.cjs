// client/vite.config.cjs
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

// Use module.exports for CommonJS format
module.exports = defineConfig({
  plugins: [react()],
  // Remove the 'server' block in the production build file
  // The server block is only needed for local development (npm run dev)
  // as it's not used when running the final 'vite build' command.
  // Including it is fine, but it's cleaner to remove for production configuration.
});