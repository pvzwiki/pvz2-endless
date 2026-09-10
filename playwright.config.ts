import { defineConfig, devices } from "@playwright/test";

// The local server health check must use loopback even when the shell has a proxy.
const localBypass = [
  process.env.NO_PROXY,
  process.env.no_proxy,
  "127.0.0.1",
  "localhost",
]
  .filter(Boolean)
  .join(",");
process.env.NO_PROXY = localBypass;
process.env.no_proxy = localBypass;

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  webServer: {
    command: process.env.CI
      ? "python3 -m http.server 4173 --bind 127.0.0.1 --directory out"
      : "npm run dev -- --hostname 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/en/",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
});
