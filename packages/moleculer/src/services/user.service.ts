import { Context, Service, ServiceBroker, ServiceSchema, Errors } from "moleculer";
import { prisma } from "../prisma";

export interface UserCreateParams {
  email: string;
  name?: string;
}

export interface UserGetParams {
  id: string;
}

export interface UserFindByEmailParams {
  email: string;
}

export default class UserService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "user",
      actions: {
        create: {
          params: {
            email: { type: "email" },
            name: { type: "string", optional: true },
          },
          async handler(ctx: Context<UserCreateParams>) {
            return prisma.user.create({
              data: {
                email: ctx.params.email,
                name: ctx.params.name,
              },
            });
          },
        },
        get: {
          params: {
            id: { type: "string" },
          },
          async handler(ctx: Context<UserGetParams>) {
            const user = await prisma.user.findUnique({
              where: { id: ctx.params.id },
            });

            if (!user) {
              throw new Errors.MoleculerClientError(
                "User not found", 
                404, 
                "USER_NOT_FOUND", 
                { requestedId: ctx.params.id }
              );
            }

            return user;
          },
        },
        getByEmail: {
          params: {
            email: { type: "string" },
          },
          async handler(ctx: Context<UserFindByEmailParams>) {
            return prisma.user.findUnique({
              where: { email: ctx.params.email },
            });
          },
        },
        remove: {
          params: {
            id: { type: "string" },
          },
          async handler(ctx: Context<UserGetParams>) {
            return prisma.user.delete({
              where: { id: ctx.params.id },
            });
          },
        },
      },
    } as ServiceSchema);
  }
}
