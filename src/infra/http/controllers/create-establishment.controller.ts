import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

import { z } from "zod";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

const createEstablishmentBodySchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  cnpj: z.string(),
  establishmentType: z.string(),
  especiality: z.string().optional(),
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

type CreateEstablishmentBodySchema = z.infer<
  typeof createEstablishmentBodySchema
>;

const updateEstablishmentBodySchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  cnpj: z.string(),
  establishmentType: z.string(),
  especiality: z.string().optional(),
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

type UpdateEstablishmentBodySchema = z.infer<
  typeof updateEstablishmentBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreateEstablishmentController {
  constructor(private prisma: PrismaService) {}

  @Post("/establishments")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createEstablishmentBodySchema))
  async create(@Body() body: CreateEstablishmentBodySchema) {
    const {
      name,
      abbreviation,
      cnpj,
      establishmentType,
      especiality,
      mainPhone,
      secondaryPhone,
      email,
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

    const nameAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        name,
      },
    });

    const abbreviationAlreadyRegistered =
      await this.prisma.establishment.findUnique({
        where: {
          abbreviation,
        },
      });

    const cnpjAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        cnpj,
      },
    });

    const emailAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        email,
      },
    });

    if (nameAlreadyRegistered) {
      throw new ConflictException(
        "Establishment with same name already exists",
      );
    }

    if (abbreviationAlreadyRegistered) {
      throw new ConflictException(
        "Establishment with same abbreviation already exists",
      );
    }

    if (cnpjAlreadyRegistered) {
      throw new ConflictException(
        "Establishment with same cnpj already exists",
      );
    }

    if (emailAlreadyRegistered) {
      throw new ConflictException(
        "Establishment with same email already exists",
      );
    }

    try {
      const establishmentCreated = await this.prisma.establishment.create({
        data: {
          name,
          abbreviation,
          cnpj,
          establishmentType,
          targetCustomer,
          especiality,
          mainPhone,
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
        const localeEstablishment = await this.prisma.address.create({
          data: addressData,
        });

        await this.prisma.establishment.update({
          where: {
            id: establishmentCreated.id,
          },
          data: {
            establishmentAddress: localeEstablishment.id,
          },
        });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to create establishment: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }

  @Put("/establishments")
  @HttpCode(200)
  @UsePipes()
  async edit(
    @Body(new ZodValidationPipe(updateEstablishmentBodySchema))
    body: UpdateEstablishmentBodySchema,
    @Query("id") id?: string,
  ) {
    if (!id) {
      throw new BadRequestException("Id was not provided");
    }

    const oldEstablishmentData = await this.prisma.establishment.findUnique({
      where: {
        id,
      },
    });

    if (!oldEstablishmentData) {
      throw new NotFoundException("Establishment not found");
    }

    const {
      name,
      abbreviation,
      cnpj,
      establishmentType,
      especiality,
      mainPhone,
      secondaryPhone,
      email,
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

    const nameAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        name,
      },
    });

    const abbreviationAlreadyRegistered =
      await this.prisma.establishment.findUnique({
        where: {
          abbreviation,
        },
      });

    const cnpjAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        cnpj,
      },
    });

    const emailAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        email,
      },
    });

    if (nameAlreadyRegistered && name !== oldEstablishmentData.name) {
      throw new ConflictException(
        "Establishment with same name already exists",
      );
    }

    if (
      abbreviationAlreadyRegistered &&
      abbreviation !== oldEstablishmentData.abbreviation
    ) {
      throw new ConflictException(
        "Establishment with same abbreviation already exists",
      );
    }

    if (cnpjAlreadyRegistered && cnpj !== oldEstablishmentData.cnpj) {
      throw new ConflictException(
        "Establishment with same cnpj already exists",
      );
    }

    if (emailAlreadyRegistered && email !== oldEstablishmentData.email) {
      throw new ConflictException(
        "Establishment with same email already exists",
      );
    }

    let newAddressId: string | null = null;

    if (oldEstablishmentData.establishmentAddress) {
      const establishmentAddressOldData = await this.prisma.address.findUnique({
        where: { id: oldEstablishmentData.establishmentAddress },
      });
      if (
        postCode !== establishmentAddressOldData?.postCode ||
        street !== establishmentAddressOldData?.postCode ||
        number !== establishmentAddressOldData?.postCode ||
        neighborhood !== establishmentAddressOldData?.postCode ||
        city !== establishmentAddressOldData?.postCode ||
        state !== establishmentAddressOldData?.postCode ||
        compliment !== establishmentAddressOldData?.postCode ||
        latitude !== establishmentAddressOldData?.postCode ||
        longitude !== establishmentAddressOldData?.postCode
      ) {
        const establishmentAddressUpdated = await this.prisma.address.update({
          where: { id: oldEstablishmentData.establishmentAddress },
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

        if (!establishmentAddressUpdated) {
          throw new BadRequestException(
            "Error during establishment address update",
          );
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
        const newEstablishmentAddress = await this.prisma.address.create({
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

        if (!newEstablishmentAddress) {
          throw new BadRequestException(
            "Error during establishment address update",
          );
        }

        newAddressId = newEstablishmentAddress.id;
      }
    }

    try {
      if (newAddressId) {
        const establishmentUpdated = await this.prisma.establishment.update({
          where: { id },
          data: {
            name,
            abbreviation,
            cnpj,
            establishmentType,
            targetCustomer,
            especiality,
            mainPhone,
            secondaryPhone,
            email,
            status,
            establishmentAddress: newAddressId,
          },
        });

        if (!establishmentUpdated) {
          throw new BadRequestException("Error during establishment update");
        }
      } else {
        const establishmentUpdated = await this.prisma.establishment.update({
          where: { id },
          data: {
            name,
            abbreviation,
            cnpj,
            establishmentType,
            targetCustomer,
            especiality,
            mainPhone,
            secondaryPhone,
            email,
            status,
          },
        });
        if (!establishmentUpdated) {
          throw new BadRequestException("Error during establishment update");
        }
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to update establishment: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
