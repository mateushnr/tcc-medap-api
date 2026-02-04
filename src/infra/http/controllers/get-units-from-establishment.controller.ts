import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Query,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

import { PrismaService } from "@/infra/database/prisma/prisma.service";

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetUnitsFromEstablishmentController {
  constructor(private prisma: PrismaService) {}

  @Get("/units/from-establishment")
  @HttpCode(200)
  async handle(@Query("id") id?: string) {
    if (id) {
      const unitsFromEstablishment = await this.prisma.unity.findMany({
        where: {
          unityEstablishment: id,
        },
      });

      if (!unitsFromEstablishment) {
        throw new NotFoundException("No unity found for this establishment");
      }

      return unitsFromEstablishment;
    } else {
      throw new BadRequestException("No id provided");
    }
  }
}
