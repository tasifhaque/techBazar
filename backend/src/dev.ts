import { app } from "./index";

const PORT = parseInt(process.env.PORT || "4000");

// ---- Port availability check ----
// Kill any stale process holding the target port.
// Prevents EADDRINUSE crashes (and Bun's SIGKILL) from a prior unclean shutdown.
try {
  const result = Bun.spawnSync(["lsof", "-ti", `:${PORT}`]);
  if (result.exitCode === 0) {
    const pids = result.stdout
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);
    for (const rawPid of pids) {
      const pid = parseInt(rawPid, 10);
      if (pid && pid !== process.pid) {
        process.kill(pid, "SIGKILL");
        console.log(`Freed port ${PORT}: killed stale process ${pid}`);
      }
    }
  }
} catch {
  // lsof not available or insufficient permissions — proceed without cleanup
}

// ---- Native Bun HTTP server ----
// Uses Bun.serve() instead of @hono/node-server to avoid Bun's Node.js HTTP
// compatibility layer, which can SIGKILL the process on port conflicts.
try {
  const server = Bun.serve({
    fetch: app.fetch,
    port: PORT,
  });

  console.log(`Backend running on http://localhost:${PORT}`);

  // Graceful shutdown — handles Ctrl+C / concurrently SIGTERM
  const shutdown = () => {
    console.log("\nShutting down server...");
    server.stop();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (err) {
  console.error(
    `Failed to start server on port ${PORT}:`,
    (err as Error).message || String(err),
  );
  process.exit(1);
}
