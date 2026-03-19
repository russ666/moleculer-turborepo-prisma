import { Context, Service, ServiceBroker, ServiceSchema } from "moleculer";

export default class GreeterService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "greeter",
      actions: {
        hello: {
          rest: "GET /hello",
          params: {
            name: { type: "string", optional: true },
          },
          handler(ctx: Context<{ name?: string }>): string {
            const name = ctx.params.name ?? "World";
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
