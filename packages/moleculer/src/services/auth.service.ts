import { Context, Errors, Service, ServiceBroker, ServiceSchema } from "moleculer";
import { PrismaClient } from "@app/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface RegisterParams {
  email: string;
  password: string;
  name?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginSocialParams {
  provider: string;
  providerAccountId: string;
  email?: string;
  name?: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
  scope?: string;
  idToken?: string;
}

export interface VerifyTokenParams {
  token: string;
}

function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export default class AuthService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "auth",
      actions: {
        register: {
          params: {
            email: { type: "email" },
            password: { type: "string", min: 8 },
            name: { type: "string", optional: true },
          },
          async handler(ctx: Context<RegisterParams>) {
            const existing = await prisma.user.findUnique({
              where: { email: ctx.params.email },
            });

            if (existing) {
              throw new Errors.MoleculerClientError(
                "Email already in use",
                400,
                "EMAIL_ALREADY_IN_USE",
                { email: ctx.params.email }
              );
            }

            const hash = await bcrypt.hash(ctx.params.password, SALT_ROUNDS);
            const user = await prisma.user.create({
              data: {
                email: ctx.params.email,
                name: ctx.params.name,
                password: {
                  create: { hash },
                },
              },
              select: { id: true, email: true, name: true, role: true },
            });

            return { token: signToken(user.id, user.role), user };
          },
        },
        login: {
          params: {
            email: { type: "email" },
            password: { type: "string" },
          },
          async handler(ctx: Context<LoginParams>) {
            const user = await prisma.user.findUnique({
              where: { email: ctx.params.email },
              include: { password: true },
            });

            if (!user || !user.password) {
              throw new Errors.MoleculerClientError(
                "Invalid credentials",
                400,
                "INVALID_CREDENTIALS",
                { email: ctx.params.email }
              );
            }

            const valid = await bcrypt.compare(
              ctx.params.password,
              user.password.hash
            );

            if (!valid) {
              throw new Errors.MoleculerClientError(
                "Invalid credentials",
                400,
                "INVALID_CREDENTIALS",
                { email: ctx.params.email }
              );
            }

            const { password: _pw, ...safeUser } = user;
            return { token: signToken(user.id, user.role), user: safeUser };
          },
        },
        loginSocial: {
          params: {
            provider: { type: "string" },
            providerAccountId: { type: "string" },
            email: { type: "email", optional: true },
            name: { type: "string", optional: true },
            avatar: { type: "string", optional: true },
            accessToken: { type: "string", optional: true },
            refreshToken: { type: "string", optional: true },
            expiresAt: { type: "string", optional: true },
            tokenType: { type: "string", optional: true },
            scope: { type: "string", optional: true },
            idToken: { type: "string", optional: true },
          },
          async handler(ctx: Context<LoginSocialParams>) {
            const {
              provider,
              providerAccountId,
              email,
              name,
              avatar,
              accessToken,
              refreshToken,
              expiresAt,
              tokenType,
              scope,
              idToken,
            } = ctx.params;

            const account = await prisma.account.findUnique({
              where: { provider_providerAccountId: { provider, providerAccountId } },
              include: { user: true },
            });

            if (account) {
              await prisma.account.update({
                where: { id: account.id },
                data: {
                  accessToken,
                  refreshToken,
                  expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                  tokenType,
                  scope,
                  idToken,
                },
              });
              return {
                token: signToken(account.user.id, account.user.role),
                user: account.user,
              };
            }

            let user = email
              ? await prisma.user.findUnique({ where: { email } })
              : null;

            if (!user) {
              user = await prisma.user.create({
                data: {
                  email,
                  name,
                  avatar,
                },
              });
            }

            await prisma.account.create({
              data: {
                userId: user.id,
                provider,
                providerAccountId,
                email,
                accessToken,
                refreshToken,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                tokenType,
                scope,
                idToken,
              },
            });

            return { token: signToken(user.id, user.role), user };
          },
        },
        verify: {
          params: {
            token: { type: "string" },
          },
          handler(ctx: Context<VerifyTokenParams>) {
            try {
              const decoded = jwt.verify(ctx.params.token, JWT_SECRET) as jwt.JwtPayload;
              return { valid: true, sub: decoded.sub, role: decoded.role };
            } catch {
              throw new Errors.MoleculerClientError(
                "Invalid or expired token",
                400,
                "INVALID_TOKEN"
              );
            }
          },
        },
      },
    } as ServiceSchema);
  }
}
