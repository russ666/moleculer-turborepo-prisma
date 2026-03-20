import { Context, Service, ServiceBroker, ServiceSchema, Errors } from "moleculer";
import { PrismaClient } from "@app/prisma";

const prisma = new PrismaClient();

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
        findById: {
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
      },
    } as ServiceSchema);
  }
}
