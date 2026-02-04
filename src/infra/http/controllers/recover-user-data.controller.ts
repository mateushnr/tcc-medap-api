import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

interface tokenProps {
  sub: string;
  name: string;
  accessLevel: string;
  establishmentBounded: string;
}

interface RequestHeaders {
  authorization: string;
}

@Controller("/sessions")
@UseGuards(JwtAuthGuard)
export class RecoverUserDataController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Get("/recover-user-data")
  async handle(@Headers() headers: RequestHeaders) {
    const authorizationHeader = headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException("Token not found.");
    }

    const token = authorizationHeader.split(" ")[1];

    const decodedToken: tokenProps = this.jwt.decode(token);

    const professional = await this.prisma.professional.findUnique({
      where: {
        id: decodedToken.sub,
      },
    });

    if (!professional) {
      throw new UnauthorizedException("Professional not found.");
    }

    const establishment = await this.prisma.establishment.findUnique({
      where: {
        id: professional.establishmentBounded,
      },
    });

    if (!establishment) {
      throw new UnauthorizedException("Professional establishment not found.");
    }

    return {
      name: professional.name,
      email: professional.email,
      accessLevel: professional.role,
      organization: establishment.abbreviation,
    };
  }
}
