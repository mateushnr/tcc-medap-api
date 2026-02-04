import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

import { z } from "zod";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

const updateEstablishmentTypeBodySchema = z.object({
  name: z.string(),
  availableFor: z.enum(["ESTABLISHMENT", "UNITY", "BOTH"]),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  establishmentRegistered: z.string().uuid().optional(),
});

type UpdateEstablishmentTypeBodySchema = z.infer<
  typeof updateEstablishmentTypeBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class UpdateEstablishmentTypeController {
  constructor(private prisma: PrismaService) {}

  @Put("/establishments/types")
  @HttpCode(200)
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(updateEstablishmentTypeBodySchema))
    body: UpdateEstablishmentTypeBodySchema,
    @Query("id") id?: string,
  ) {
    if (!id) {
      throw new BadRequestException("Id was not provided");
    }

    const oldEstablishmentTypeData =
      await this.prisma.establishmentType.findUnique({
        where: {
          id,
        },
      });

    if (!oldEstablishmentTypeData) {
      throw new NotFoundException("Establishment type not found");
    }

    const { name, availableFor, status, establishmentRegistered } = body;

    const nameAlreadyRegistered =
      await this.prisma.establishmentType.findUnique({
        where: {
          name,
        },
      });

    if (nameAlreadyRegistered && name !== oldEstablishmentTypeData.name) {
      throw new ConflictException(
        "Establishment type with same name already exists",
      );
    }

    const establishmentRegisteredUpdated = establishmentRegistered || null;

    try {
      const establishmentTypeUpdated =
        await this.prisma.establishmentType.update({
          where: { id },
          data: {
            name,
            availableFor,
            status,
            establishmentRegistered: establishmentRegisteredUpdated,
          },
        });

      if (!establishmentTypeUpdated) {
        throw new BadRequestException("Error during establishment type update");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to update establishment type: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
