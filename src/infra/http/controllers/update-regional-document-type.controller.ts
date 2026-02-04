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

const updateRegionalDocumentTypeBodySchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  establishmentRegistered: z.string().uuid().optional(),
});

type UpdateRegionalDocumentTypeBodySchema = z.infer<
  typeof updateRegionalDocumentTypeBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class UpdateRegionalDocumentTypeController {
  constructor(private prisma: PrismaService) {}

  @Put("/professionals/documents")
  @HttpCode(200)
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(updateRegionalDocumentTypeBodySchema))
    body: UpdateRegionalDocumentTypeBodySchema,
    @Query("id") id?: string,
  ) {
    if (!id) {
      throw new BadRequestException("Id was not provided");
    }

    const oldRegionalDocumentTypeData =
      await this.prisma.regionalDocumentType.findUnique({
        where: {
          id,
        },
      });

    if (!oldRegionalDocumentTypeData) {
      throw new NotFoundException("Regional document type not found");
    }

    const { name, abbreviation, status, establishmentRegistered } = body;

    const nameAlreadyRegistered =
      await this.prisma.regionalDocumentType.findUnique({
        where: {
          name,
        },
      });

    if (nameAlreadyRegistered && name !== oldRegionalDocumentTypeData.name) {
      throw new ConflictException(
        "Regional document type with same name already exists",
      );
    }

    const establishmentRegisteredUpdated = establishmentRegistered || null;

    try {
      const RegionalDocumentTypeUpdated =
        await this.prisma.regionalDocumentType.update({
          where: { id },
          data: {
            name,
            abbreviation,
            status,
            establishmentRegistered: establishmentRegisteredUpdated,
          },
        });

      if (!RegionalDocumentTypeUpdated) {
        throw new BadRequestException(
          "Error during regional document type update",
        );
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to update regional document type: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
