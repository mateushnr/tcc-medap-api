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
import { hash } from "bcryptjs";

const updateProfessionalBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string(),
  phone: z.string(),
  role: z.enum([
    "HEALTH_PROFESSIONAL",
    "MANAGER",
    "RESPONSIBLE",
    "ADMINISTRATOR",
  ]),
  birthDate: z.string().optional(),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  password: z
    .string()
    .refine(
      (password) => password === "" || password.length >= 6,
      "A senha deve ter no mínimo 6 digitos",
    )
    .optional(),
  especiality: z.string().optional(),
  boundedTo: z.enum(["ESTABLISHMENT", "UNITY"]),
  establishmentBounded: z.string().uuid(),
  regionalDocument: z.string().optional(),
  regionalDocumentType: z.string().optional(),
  stateDocumentIssued: z.string().optional(),
  unityBounded: z.string().optional(),
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

type UpdateProfessionalBodySchema = z.infer<
  typeof updateProfessionalBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class UpdateProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Put("/professionals")
  @HttpCode(200)
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(updateProfessionalBodySchema))
    body: UpdateProfessionalBodySchema,
    @Query("id") id?: string,
  ) {
    if (!id) {
      throw new BadRequestException("Id was not provided");
    }

    const oldProfessionalData = await this.prisma.professional.findUnique({
      where: {
        id,
      },
    });

    if (!oldProfessionalData) {
      throw new NotFoundException("Professional not found");
    }

    const {
      name,
      email,
      cpf,
      phone,
      role,
      birthDate,
      status,
      password,
      stateDocumentIssued,
      regionalDocument,
      regionalDocumentType,
      establishmentBounded,
      unityBounded,
      boundedTo,
      especiality,
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

    const establishmentToRegister = await this.prisma.establishment.findUnique({
      where: {
        id: establishmentBounded,
      },
    });

    if (!establishmentToRegister) {
      throw new ConflictException("Establishment to edit does not exists.");
    }

    const emailAlreadyRegistered = await this.prisma.professional.findFirst({
      where: {
        AND: [
          {
            email,
          },
          {
            establishmentBounded: establishmentToRegister.id,
          },
        ],
      },
    });

    const cpfAlreadyRegistered = await this.prisma.professional.findFirst({
      where: {
        AND: [
          {
            cpf,
          },
          {
            establishmentBounded: establishmentToRegister.id,
          },
        ],
      },
    });

    if (emailAlreadyRegistered && email !== oldProfessionalData.email) {
      throw new ConflictException(
        "Professional with same email already exists.",
      );
    }

    if (cpfAlreadyRegistered && cpf !== oldProfessionalData.cpf) {
      throw new ConflictException("Professional with same CPF already exists.");
    }

    let newAddressId: string | null = null;

    if (oldProfessionalData.professionalAddress) {
      const professionalAddressOldData = await this.prisma.address.findUnique({
        where: { id: oldProfessionalData.professionalAddress },
      });
      if (
        postCode !== professionalAddressOldData?.postCode ||
        street !== professionalAddressOldData?.postCode ||
        number !== professionalAddressOldData?.postCode ||
        neighborhood !== professionalAddressOldData?.postCode ||
        city !== professionalAddressOldData?.postCode ||
        state !== professionalAddressOldData?.postCode ||
        compliment !== professionalAddressOldData?.postCode ||
        latitude !== professionalAddressOldData?.postCode ||
        longitude !== professionalAddressOldData?.postCode
      ) {
        const professionalAddressUpdated = await this.prisma.address.update({
          where: { id: oldProfessionalData.professionalAddress },
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

        if (!professionalAddressUpdated) {
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
        const newProfessionalAddress = await this.prisma.address.create({
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

        if (!newProfessionalAddress) {
          throw new BadRequestException(
            "Error during professional address update",
          );
        }

        newAddressId = newProfessionalAddress.id;
      }
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */

    try {
      const updateData: any = {
        name,
        email,
        cpf,
        phone,
        role,
        birthDate,
        status,
        stateDocumentIssued,
        regionalDocument,
        establishmentBounded,
        boundedTo,
        especiality,
        ...(unityBounded && { unityBounded }),
        ...(regionalDocumentType && { regionalDocumentType }),
        ...(newAddressId && { professionalAddress: newAddressId }),
        ...(password && { password: await hash(password, 8) }),
      };

      if (!unityBounded) {
        updateData.unityBounded = null;
        updateData.boundedTo = "ESTABLISHMENT";
      }

      const professionalUpdated = await this.prisma.professional.update({
        where: { id },
        data: updateData,
      });

      if (!professionalUpdated) {
        throw new BadRequestException("Error during professional update");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to update professional: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
