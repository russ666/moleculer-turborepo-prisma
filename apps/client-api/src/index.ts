import { ServiceBroker, Middleware } from "moleculer";
import { Middleware as ChannelsMiddleware, Adapters as ChannelsAdapters } from "@moleculer/channels";
import GreeterService from "./services/greeter.service";
import HealthService from "./services/health.service";
import ApiService from "./services/api.service";

const broker = new ServiceBroker({
  transporter: process.env.NATS_URL || "nats://localhost:4222",
  cacher: process.env.REDIS_URL || "redis://localhost:6379",
  middlewares: [
    ChannelsMiddleware({
        adapter: new ChannelsAdapters.NATS({
            url: process.env.NATS_URL || "nats://localhost:4222"
        })
    }) as unknown as Middleware
  ],
});

broker.createService(GreeterService);
broker.createService(HealthService);
broker.createService(ApiService);

broker.start()
  .then(async () => {
    broker.logger.info("Broker started");
    await broker.call<string, { name: string }>(
      "greeter.hello",
      { name: "Moleculer" }
    );
  })
  .catch((err) => {
    broker.logger.error("Error starting broker:", err);
  });
