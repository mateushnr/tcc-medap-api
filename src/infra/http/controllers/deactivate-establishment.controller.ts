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

const deactivateEstablishmentBodySchema = z.object({
  idEstablishmentToDeactivate: z.string(),
});

type DeactivateEstablishmentBodySchema = z.infer<
  typeof deactivateEstablishmentBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class DeactivateEstablishmentController {
  constructor(private prisma: PrismaService) {}

  @Patch("/establishments/deactivate")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(deactivateEstablishmentBodySchema))
  async handle(@Body() body: DeactivateEstablishmentBodySchema) {
    const { idEstablishmentToDeactivate } = body;

    try {
      const establishmentDeactivated = await this.prisma.establishment.update({
        where: {
          id: idEstablishmentToDeactivate,
        },
        data: {
          status: "DEACTIVATED",
        },
      });

      if (!establishmentDeactivated) {
        throw new NotFoundException("Establishment to deactivate not found");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "Failed to deactivate establishment: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
