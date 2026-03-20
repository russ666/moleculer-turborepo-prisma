import { ServiceBroker } from "moleculer";
import { brokerConfig, GreeterService } from "@app/moleculer";

import HealthService from "./services/health.service";
import ApiService from "./services/api.service";

const broker = new ServiceBroker(brokerConfig);

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
