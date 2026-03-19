import * as net from "net";
import { Context, Service, ServiceBroker, ServiceSchema } from "moleculer";

interface DepStatus {
  status: "ok" | "error";
  latency?: number;
  error?: string;
}

interface HealthResult {
  status: "ok" | "degraded";
  uptime: number;
  timestamp: string;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  dependencies: {
    postgres: DepStatus;
    redis: DepStatus;
    nats: DepStatus;
  };
}

function tcpCheck(host: string, port: number, timeout = 3000): Promise<DepStatus> {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket
      .connect(port, host, () => {
        socket.destroy();
        resolve({ status: "ok", latency: Date.now() - start });
      })
      .on("error", (err: Error) => {
        socket.destroy();
        resolve({ status: "error", error: err.message });
      })
      .on("timeout", () => {
        socket.destroy();
        resolve({ status: "error", error: "timeout" });
      });
  });
}

function parseAddr(url: string, defaultPort: number): { host: string; port: number } {
  try {
    const u = new URL(url);
    return { host: u.hostname || "localhost", port: u.port ? Number(u.port) : defaultPort };
  } catch {
    return { host: "localhost", port: defaultPort };
  }
}

export default class HealthService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "health",
      actions: {
        check: {
          rest: "GET /",
          cache: false,
          async handler(ctx: Context): Promise<HealthResult> {
            const pg = parseAddr(process.env.DATABASE_URL ?? "postgresql://localhost:5432", 5432);
            const rd = parseAddr(process.env.REDIS_URL ?? "redis://localhost:6379", 6379);
            const ns = parseAddr(process.env.NATS_URL ?? "nats://localhost:4222", 4222);

            const [postgres, redis, nats] = await Promise.all([
              tcpCheck(pg.host, pg.port),
              tcpCheck(rd.host, rd.port),
              tcpCheck(ns.host, ns.port),
            ]);

            const allOk = [postgres, redis, nats].every((s) => s.status === "ok");

            if (!allOk) {
              (ctx.meta as Record<string, unknown>).$statusCode = 503;
            }

            const mem = process.memoryUsage();
            return {
              status: allOk ? "ok" : "degraded",
              uptime: Math.floor(process.uptime()),
              timestamp: new Date().toISOString(),
              memory: {
                rss: mem.rss,
                heapUsed: mem.heapUsed,
                heapTotal: mem.heapTotal,
              },
              dependencies: { postgres, redis, nats },
            };
          },
        },
      },
    } as ServiceSchema);
  }
}
