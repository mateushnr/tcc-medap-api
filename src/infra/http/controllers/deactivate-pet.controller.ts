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

const deactivatePetBodySchema = z.object({
  idPetToDeactivate: z.string(),
});

type DeactivatePetBodySchema = z.infer<typeof deactivatePetBodySchema>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class DeactivatePetController {
  constructor(private prisma: PrismaService) {}

  @Patch("/pets/deactivate")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(deactivatePetBodySchema))
  async handle(@Body() body: DeactivatePetBodySchema) {
    const { idPetToDeactivate } = body;

    try {
      const petDeactivated = await this.prisma.pet.update({
        where: {
          id: idPetToDeactivate,
        },
        data: {
          status: "DEACTIVATED",
        },
      });

      if (!petDeactivated) {
        throw new NotFoundException("Pet to deactivate not found");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "Failed to deactivate pet: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
