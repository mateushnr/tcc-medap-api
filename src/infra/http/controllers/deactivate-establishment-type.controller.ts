import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Patch,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

import { z } from "zod";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

const deactivateEstablishmentTypeBodySchema = z.object({
  idEstablishmentTypeToDeactivate: z.string(),
});

type DeactivateEstablishmentTypeBodySchema = z.infer<
  typeof deactivateEstablishmentTypeBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class DeactivateEstablishmentTypeController {
  constructor(private prisma: PrismaService) {}

  @Patch("/establishments/types/deactivate")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(deactivateEstablishmentTypeBodySchema))
  async handle(@Body() body: DeactivateEstablishmentTypeBodySchema) {
    const { idEstablishmentTypeToDeactivate } = body;

    try {
      const establishmentTypeDeactivated =
        await this.prisma.establishmentType.update({
          where: {
            id: idEstablishmentTypeToDeactivate,
          },
          data: {
            status: "DEACTIVATED",
          },
        });

      if (!establishmentTypeDeactivated) {
        throw new NotFoundException(
          "Establishment type to deactivate not found",
        );
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "Failed to deactivate establishment type: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
