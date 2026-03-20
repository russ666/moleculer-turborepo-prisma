import { BrokerOptions, Middleware } from "moleculer";
import { Middleware as ChannelsMiddleware, Adapters as ChannelsAdapters } from "@moleculer/channels";

export const brokerConfig: BrokerOptions = {
  transporter: process.env.NATS_URL || "nats://localhost:4222",
  cacher: process.env.REDIS_URL || "redis://localhost:6379",
  middlewares: [
    ChannelsMiddleware({
      adapter: new ChannelsAdapters.NATS({
        url: process.env.NATS_URL || "nats://localhost:4222",
      }),
    }) as unknown as Middleware,
  ],
};
