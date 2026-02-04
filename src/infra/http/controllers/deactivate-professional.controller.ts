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

const deactivateProfessionalBodySchema = z.object({
  idProfessionalToDeactivate: z.string(),
});

type DeactivateProfessionalBodySchema = z.infer<
  typeof deactivateProfessionalBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class DeactivateProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Patch("/professionals/deactivate")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(deactivateProfessionalBodySchema))
  async handle(@Body() body: DeactivateProfessionalBodySchema) {
    const { idProfessionalToDeactivate } = body;

    try {
      const professionalDeactivated = await this.prisma.professional.update({
        where: {
          id: idProfessionalToDeactivate,
        },
        data: {
          status: "DEACTIVATED",
        },
      });

      if (!professionalDeactivated) {
        throw new NotFoundException("Professional to deactivate not found");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "Failed to deactivate professional: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
