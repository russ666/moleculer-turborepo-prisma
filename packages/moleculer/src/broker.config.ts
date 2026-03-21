import { BrokerOptions, Middleware } from "moleculer";
import { Middleware as ChannelsMiddleware, Adapters as ChannelsAdapters } from "@moleculer/channels";
import { config } from "./config";

console.log("Using NATS URL:", config.NATS_URL);

export const brokerConfig: BrokerOptions = {
  transporter: config.NATS_URL,
  cacher: config.REDIS_URL,
  middlewares: [
    ChannelsMiddleware({
      adapter: new ChannelsAdapters.NATS({
        url: config.NATS_URL,
      }),
    }) as unknown as Middleware,
  ],
};
