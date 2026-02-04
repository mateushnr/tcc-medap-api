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

const deactivateUnityBodySchema = z.object({
  idUnityToDeactivate: z.string(),
});

type DeactivateUnityBodySchema = z.infer<typeof deactivateUnityBodySchema>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class DeactivateUnityController {
  constructor(private prisma: PrismaService) {}

  @Patch("/units/deactivate")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(deactivateUnityBodySchema))
  async handle(@Body() body: DeactivateUnityBodySchema) {
    const { idUnityToDeactivate } = body;

    try {
      const unityDeactivated = await this.prisma.unity.update({
        where: {
          id: idUnityToDeactivate,
        },
        data: {
          status: "DEACTIVATED",
        },
      });

      if (!unityDeactivated) {
        throw new NotFoundException("Unity to deactivate not found");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "Failed to deactivate unity: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
