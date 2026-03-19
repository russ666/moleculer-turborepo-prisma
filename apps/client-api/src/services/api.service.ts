import { Service, ServiceBroker, ServiceSchema } from "moleculer";
import ApiGateway from "moleculer-web";

export default class ApiService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "api",
      mixins: [ApiGateway],
      settings: {
        port: process.env.PORT ? Number(process.env.PORT) : 8000,
        routes: [
          {
            path: "/health",
            aliases: {
              "GET /": "health.check",
            },
          },
          {
            path: "/api",
            aliases: {
              "GET /greeter/hello": "greeter.hello",
              "GET /greeter/welcome": "greeter.welcome",
            },
          },
        ],
        assets: {
          folder: "public",
        },
      },
    } as ServiceSchema);
  }
}
