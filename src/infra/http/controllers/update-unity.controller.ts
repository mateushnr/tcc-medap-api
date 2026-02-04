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

const updateUnityBodySchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  cnpj: z.string(),
  unityType: z.string(),
  especiality: z.string().optional(),
  unityEstablishment: z.string().uuid(),
  mainPhone: z.string(),
  secondaryPhone: z.string().optional(),
  email: z.string().email(),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  targetCustomer: z.enum(["HUMAN", "ANIMAL", "MIXED"]),
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

type UpdateUnityBodySchema = z.infer<typeof updateUnityBodySchema>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class UpdateUnityController {
  constructor(private prisma: PrismaService) {}

  @Put("/units")
  @HttpCode(200)
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(updateUnityBodySchema))
    body: UpdateUnityBodySchema,
    @Query("id") id?: string,
  ) {
    if (!id) {
      throw new BadRequestException("Id was not provided");
    }

    const oldUnityData = await this.prisma.unity.findUnique({
      where: {
        id,
      },
    });

    if (!oldUnityData) {
      throw new NotFoundException("Unity not found");
    }

    const {
      name,
      abbreviation,
      cnpj,
      unityType,
      especiality,
      mainPhone,
      secondaryPhone,
      email,
      unityEstablishment,
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

    if (nameAlreadyRegistered && name !== oldUnityData.name) {
      throw new ConflictException("Unity with same name already exists");
    }

    if (
      abbreviationAlreadyRegistered &&
      abbreviation !== oldUnityData.abbreviation
    ) {
      throw new ConflictException(
        "Unity with same abbreviation already exists",
      );
    }

    if (cnpjAlreadyRegistered && cnpj && cnpj !== oldUnityData.cnpj) {
      throw new ConflictException("Unity with same cnpj already exists");
    }

    if (emailAlreadyRegistered && email !== oldUnityData.email) {
      throw new ConflictException("Unity with same email already exists");
    }

    let newAddressId: string | null = null;

    if (oldUnityData.unityAddress) {
      const unityAddressOldData = await this.prisma.address.findUnique({
        where: { id: oldUnityData.unityAddress },
      });
      if (
        postCode !== unityAddressOldData?.postCode ||
        street !== unityAddressOldData?.postCode ||
        number !== unityAddressOldData?.postCode ||
        neighborhood !== unityAddressOldData?.postCode ||
        city !== unityAddressOldData?.postCode ||
        state !== unityAddressOldData?.postCode ||
        compliment !== unityAddressOldData?.postCode ||
        latitude !== unityAddressOldData?.postCode ||
        longitude !== unityAddressOldData?.postCode
      ) {
        const unityAddressUpdated = await this.prisma.address.update({
          where: { id: oldUnityData.unityAddress },
          data: {
            postCode,
            street,
            number,
            neighborhood,
            city,
            state,
            compliment,
            latitude,
            longitude,
          },
        });

        if (!unityAddressUpdated) {
          throw new BadRequestException("Error during unity address update");
        }
      }
    } else {
      if (
        postCode ||
        street ||
        number ||
        neighborhood ||
        city ||
        state ||
        compliment ||
        latitude ||
        longitude
      ) {
        const newUnityAddress = await this.prisma.address.create({
          data: {
            postCode,
            street,
            number,
            neighborhood,
            city,
            state,
            compliment,
            latitude,
            longitude,
          },
        });

        if (!newUnityAddress) {
          throw new BadRequestException("Error during unity address update");
        }

        newAddressId = newUnityAddress.id;
      }
    }

    try {
      if (newAddressId) {
        const unityUpdated = await this.prisma.unity.update({
          where: { id },
          data: {
            name,
            abbreviation,
            cnpj: cnpj || null,
            unityType,
            targetCustomer,
            especiality,
            mainPhone,
            secondaryPhone,
            email,
            status,
            unityAddress: newAddressId,
            unityEstablishment,
          },
        });

        if (!unityUpdated) {
          throw new BadRequestException("Error during establishment update");
        }
      } else {
        const unityUpdated = await this.prisma.unity.update({
          where: { id },
          data: {
            name,
            abbreviation,
            cnpj: cnpj || null,
            unityType,
            targetCustomer,
            especiality,
            mainPhone,
            secondaryPhone,
            email,
            status,
            unityEstablishment,
          },
        });
        if (!unityUpdated) {
          throw new BadRequestException("Error during unity update");
        }
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException("Failed to update unity: " + error.message);
      } else {
        throw error;
      }
    }
  }
}
