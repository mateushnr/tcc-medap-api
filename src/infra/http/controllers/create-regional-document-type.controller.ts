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

const createRegionalDocumentTypeBodySchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  establishmentRegistered: z.string().uuid().optional(),
});

type CreateRegionalDocumentTypeBodySchema = z.infer<
  typeof createRegionalDocumentTypeBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreateRegionalDocumentTypeController {
  constructor(private prisma: PrismaService) {}

  @Post("/professionals/documents")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createRegionalDocumentTypeBodySchema))
  async handle(@Body() body: CreateRegionalDocumentTypeBodySchema) {
    const { name, abbreviation, status, establishmentRegistered } = body;

    const nameAlreadyRegistered =
      await this.prisma.establishmentType.findUnique({
        where: {
          name,
        },
      });

    if (nameAlreadyRegistered) {
      throw new ConflictException(
        "Regional document type with same name already exists",
      );
    }

    try {
      await this.prisma.regionalDocumentType.create({
        data: {
          name,
          abbreviation,
          status,
          establishmentRegistered,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to create regional document type: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
