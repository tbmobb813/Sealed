/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sealed/ui", "@sealed/types"],
  // This repo already has its own AI-agent instructions at .claude/CLAUDE.md
  // — don't let `next dev` inject a second, conflicting AGENTS.md/CLAUDE.md
  // at the app root.
  agentRules: false,
};

export default nextConfig;
