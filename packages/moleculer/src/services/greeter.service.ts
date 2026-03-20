import { Context, Service, ServiceBroker, ServiceSchema } from "moleculer";

export default class GreeterService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "greeter",
      channels: {
        "greeter.welcome.channel": {
          async handler(payload: { name: string }) {
            broker.logger.info(`Channel received greeter.welcome.channel message for: ${payload.name}`);
          },
        },
      },
      actions: {
        hello: {
          rest: "GET /hello",
          params: {
            name: { type: "string", optional: true },
          },
          async handler(ctx: Context<{ name?: string }>): Promise<string> {
            const name = ctx.params.name ?? "World";
            broker.logger.info(`Action 'hello' called with name: ${name}`);
            await broker.sendToChannel("greeter.welcome.channel", { name });
            return `Hello, ${name}!`;
          },
        },
        welcome: {
          rest: "GET /welcome",
          params: {
            name: { type: "string" },
          },
          handler(ctx: Context<{ name: string }>): string {
            return `Welcome, ${ctx.params.name}!`;
          },
        },
      },
    } as ServiceSchema);
  }
}
