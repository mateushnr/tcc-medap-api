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

const createUnityBodySchema = z.object({
  name: z.string(),
  abbreviation: z.string().optional(),
  cnpj: z.string().optional(),
  unityType: z.string(),
  especiality: z.string().optional(),
  mainPhone: z.string(),
  secondaryPhone: z.string().optional(),
  email: z.string().email(),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  targetCustomer: z.enum(["HUMAN", "ANIMAL", "MIXED"]),
  boundedTo: z.string().uuid(),
  postCode: z.string().optional(),
  street: z.string().optional(),
  number: z.coerce.number().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  compliment: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type CreateUnityBodySchema = z.infer<typeof createUnityBodySchema>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreateUnityController {
  constructor(private prisma: PrismaService) {}

  @Post("/units")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUnityBodySchema))
  async handle(@Body() body: CreateUnityBodySchema) {
    const {
      name,
      abbreviation,
      cnpj,
      unityType,
      especiality,
      mainPhone,
      secondaryPhone,
      email,
      boundedTo,
      status,
      targetCustomer,
      postCode,
      street,
      number,
      neighborhood,
      city,
      state,
      compliment,
      latitude,
      longitude,
    } = body;

    const nameAlreadyRegistered = await this.prisma.unity.findUnique({
      where: {
        name,
      },
    });

    const abbreviationAlreadyRegistered = await this.prisma.unity.findUnique({
      where: {
        abbreviation,
      },
    });

    const cnpjAlreadyRegistered = await this.prisma.unity.findUnique({
      where: {
        cnpj,
      },
    });

    const emailAlreadyRegistered = await this.prisma.unity.findUnique({
      where: {
        email,
      },
    });

    if (nameAlreadyRegistered) {
      throw new ConflictException("Unity with same name already exists");
    }

    if (abbreviationAlreadyRegistered) {
      throw new ConflictException(
        "Unity with same abbreviation already exists",
      );
    }

    let cnpjValue = cnpj;

    if (!cnpj) {
      cnpjValue = undefined;
    }

    if (cnpjAlreadyRegistered && cnpj) {
      throw new ConflictException("Unity with same cnpj already exists");
    }

    if (emailAlreadyRegistered) {
      throw new ConflictException("Unity with same email already exists");
    }

    try {
      const unityCreated = await this.prisma.unity.create({
        data: {
          name,
          abbreviation,
          cnpj: cnpjValue,
          unityType,
          targetCustomer,
          especiality,
          mainPhone,
          unityEstablishment: boundedTo,
          secondaryPhone,
          email,
          status,
        },
      });

      const addressData = {
        street,
        number,
        neighborhood,
        city,
        state,
        postCode,
        compliment,
        latitude,
        longitude,
      };

      const hasAddressData = Object.values(addressData).some(
        (value) => value !== undefined && value !== "",
      );

      if (hasAddressData) {
        const localeUnity = await this.prisma.address.create({
          data: addressData,
        });

        await this.prisma.unity.update({
          where: {
            id: unityCreated.id,
          },
          data: {
            unityAddress: localeUnity.id,
          },
        });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException("Failed to create unity: " + error.message);
      } else {
        throw error;
      }
    }
  }
}
