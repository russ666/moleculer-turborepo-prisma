import { Context, Service, ServiceBroker } from "moleculer";

export default class GreeterService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "greeter",
      channels: {
        "greeter.welcome.channel": {
          async handler(this: GreeterService, payload: { name: string }) {
            this.broker.logger.info(`Channel received greeter.welcome.channel message for: ${payload.name}`);
          },
        },
      },
      actions: {
        hello: {
          params: {
            name: { type: "string", optional: true },
          },
          async handler(ctx: Context<{ name?: string }>): Promise<string> {
            const name = ctx.params.name ?? "World";
            this.broker.logger.info(`Action 'hello' called with name: ${name}`);
            await this.broker.sendToChannel("greeter.welcome.channel", { name });
            return `Hello, ${name}!`;
          },
        },
        welcome: {
          params: {
            name: { type: "string" },
          },
          handler(ctx: Context<{ name: string }>): string {
            return `Welcome, ${ctx.params.name}!`;
          },
        },
      },
    });
  }
}
