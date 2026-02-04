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

const deactivateRegionalDocumentTypeBodySchema = z.object({
  idRegionalDocumentTypeToDeactivate: z.string(),
});

type DeactivateRegionalDocumentTypeBodySchema = z.infer<
  typeof deactivateRegionalDocumentTypeBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class DeactivateRegionalDocumentTypeController {
  constructor(private prisma: PrismaService) {}

  @Patch("/professionals/documents/deactivate")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(deactivateRegionalDocumentTypeBodySchema))
  async handle(@Body() body: DeactivateRegionalDocumentTypeBodySchema) {
    const { idRegionalDocumentTypeToDeactivate } = body;

    try {
      const regionalDocumentTypeDeactivated =
        await this.prisma.regionalDocumentType.update({
          where: {
            id: idRegionalDocumentTypeToDeactivate,
          },
          data: {
            status: "DEACTIVATED",
          },
        });

      if (!regionalDocumentTypeDeactivated) {
        throw new NotFoundException(
          "Regional document type to deactivate not found",
        );
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "Failed to deactivate regional document type: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
