import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { z } from "zod";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

const authenticateBodySchema = z.object({
  organization: z.string(),
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller("/sessions")
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { organization, email, password } = body;

    const establishment = await this.prisma.establishment.findFirst({
      where: {
        OR: [
          {
            name: organization,
          },
          {
            abbreviation: organization,
          },
        ],
      },
    });

    if (!establishment) {
      throw new UnauthorizedException("Professional credentials do not match.");
    }

    const professional = await this.prisma.professional.findFirst({
      where: {
        AND: [
          {
            email,
          },
          {
            establishmentBounded: establishment.id,
          },
        ],
      },
    });

    if (!professional) {
      throw new UnauthorizedException("Professional credentials do not match.");
    }

    const isPasswordValid = await compare(password, professional.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Professional credentials do not match.");
    }

    const accessToken = this.jwt.sign({
      sub: professional.id,
      name: professional.name,
      accessLevel: professional.role,
      establishmentBounded: establishment.id,
    });

    return {
      accessToken,
    };
  }
}
