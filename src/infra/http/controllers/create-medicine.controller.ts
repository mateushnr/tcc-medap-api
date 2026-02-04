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

const createMedicineBodySchema = z.object({
  name: z.string(),
  pharmaceuticalForm: z.enum([
    "COMPRIMIDO",
    "CAPSULA",
    "DRAGEA",
    "PASTILHA",
    "SUPOSITORIO",
    "POMADA",
    "CREME",
    "GEL",
    "XAROPE",
    "GOTA",
    "NASAL",
    "OFTALMICA",
    "INJETAVEL",
    "SPRAY",
    "AEROSSOL",
  ]),
  regulatoryCategory: z
    .enum([
      "FITOTERAPICO",
      "INOVADOR",
      "NOVO",
      "SIMILAR",
      "BIOLOGICO",
      "ESPECIFICO",
      "GENERICO",
      "DINAMIZADO",
      "SINTETICO",
      "RADIOFARMACO",
      "INDUSTRIALIZADO",
    ])
    .optional(),
  activeIngredient: z.string().optional(),
  forUse: z.enum(["HUMAN", "ANIMAL", "BOTH"]),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  establishmentRegistered: z.string().optional(),
});

type CreateMedicineBodySchema = z.infer<typeof createMedicineBodySchema>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreateMedicineController {
  constructor(private prisma: PrismaService) {}

  @Post("/medicines")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createMedicineBodySchema))
  async handle(@Body() body: CreateMedicineBodySchema) {
    const {
      name,
      pharmaceuticalForm,
      regulatoryCategory,
      activeIngredient,
      forUse,
      status,
      establishmentRegistered,
    } = body;

    const nameAlreadyRegistered = await this.prisma.medicine.findFirst({
      where: {
        AND: [
          {
            name,
          },
          {
            establishmentRegistered,
          },
        ],
      },
    });

    if (nameAlreadyRegistered) {
      throw new ConflictException("Medicine with same name already exists");
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const createMedicineData: any = {
      name,
      pharmaceuticalForm,
      regulatoryCategory,
      activeIngredient,
      forUse,
      status,
      ...(establishmentRegistered && { establishmentRegistered }),
    };

    try {
      await this.prisma.medicine.create({
        data: createMedicineData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to create medicine: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
