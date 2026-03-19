import { ServiceBroker } from "moleculer";
import GreeterService from "./services/greeter.service";
import ApiService from "./services/api.service";

const broker = new ServiceBroker({
  nodeID: "client-api",
  logger: {
    type: "Console",
    options: {
      colors: true,
      moduleColors: true,
      formatter: "full",
    },
  },
});

broker.createService(GreeterService);
broker.createService(ApiService);

broker.start().then(async () => {
  const result = await broker.call<string, { name: string }>(
    "greeter.hello",
    { name: "Moleculer" }
  );
  broker.logger.info("Result:", result);
});
