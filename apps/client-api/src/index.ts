import { ServiceBroker } from "moleculer";
import GreeterService from "./services/greeter.service";
import ApiService from "./services/api.service";
import HealthService from "./services/health.service";

const broker = new ServiceBroker({
});

broker.createService(GreeterService);
broker.createService(HealthService);
broker.createService(ApiService);

broker.start()
  .then(async () => {
    broker.logger.info("Broker started");
  })
  .catch((err) => {
    broker.logger.error("Error starting broker:", err);
  });
