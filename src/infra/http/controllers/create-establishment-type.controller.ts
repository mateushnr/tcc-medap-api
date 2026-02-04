import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

import { z } from "zod";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

const createEstablishmentTypeBodySchema = z.object({
  name: z.string(),
  availableFor: z.enum(["ESTABLISHMENT", "UNITY", "BOTH"]),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  establishmentRegistered: z.string().optional(),
});

type CreateEstablishmentTypeBodySchema = z.infer<
  typeof createEstablishmentTypeBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreateEstablishmentTypeController {
  constructor(private prisma: PrismaService) {}

  @Post("/establishments/types")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createEstablishmentTypeBodySchema))
  async handle(@Body() body: CreateEstablishmentTypeBodySchema) {
    const { name, availableFor, status, establishmentRegistered } = body;

    const nameAlreadyRegistered =
      await this.prisma.establishmentType.findUnique({
        where: {
          name,
        },
      });

    if (nameAlreadyRegistered) {
      throw new ConflictException(
        "Establishment type with same name already exists",
      );
    }

    try {
      await this.prisma.establishmentType.create({
        data: {
          name,
          availableFor,
          status,
          establishmentRegistered,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to create establishment type: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
