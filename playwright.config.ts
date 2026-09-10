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
    command: "python3 -m http.server 4184 --bind 127.0.0.1 --directory out",
    url: "http://127.0.0.1:4184/en/",
    reuseExistingServer: false,
    timeout: 120000,
  },
  use: {
    baseURL: "http://127.0.0.1:4184",
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
