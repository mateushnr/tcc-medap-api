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

const deactivateCustomerBodySchema = z.object({
  idCustomerToDeactivate: z.string(),
});

type DeactivateCustomerBodySchema = z.infer<
  typeof deactivateCustomerBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class DeactivateCustomerController {
  constructor(private prisma: PrismaService) {}

  @Patch("/customers/deactivate")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(deactivateCustomerBodySchema))
  async handle(@Body() body: DeactivateCustomerBodySchema) {
    const { idCustomerToDeactivate } = body;

    try {
      const customerDeactivated = await this.prisma.customer.update({
        where: {
          id: idCustomerToDeactivate,
        },
        data: {
          status: "DEACTIVATED",
        },
      });

      if (!customerDeactivated) {
        throw new NotFoundException("Customer to deactivate not found");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          "Failed to deactivate customer: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
