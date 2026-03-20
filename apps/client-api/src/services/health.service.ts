import { Context, Service, ServiceBroker, ServiceSchema } from "moleculer";

interface HealthResult {
  status: "ok";
}

export default class HealthService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "health",
      actions: {
        check: {
          async handler(ctx: Context): Promise<HealthResult> {
            return {
              status: "ok",
            };
          },
        },
      },
    } as ServiceSchema);
  }
}
