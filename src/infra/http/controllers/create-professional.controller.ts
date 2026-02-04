import {
  Controller,
  Post,
  HttpCode,
  Body,
  ConflictException,
  UsePipes,
  UseGuards,
} from "@nestjs/common";
import { hash } from "bcryptjs";
import { z } from "zod";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { Prisma, Professional } from "@prisma/client";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

const createProfessionalBodySchema = z.object({
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
  password: z.string().min(6),
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

type CreateProfessionalBodySchema = z.infer<
  typeof createProfessionalBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreateProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Post("/professionals")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createProfessionalBodySchema))
  async handle(@Body() body: CreateProfessionalBodySchema) {
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
      ...addressData
    } = body;

    const establishmentToRegister = await this.prisma.establishment.findUnique({
      where: {
        id: establishmentBounded,
      },
    });

    if (!establishmentToRegister) {
      throw new ConflictException("Establishment to register does not exists.");
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

    if (emailAlreadyRegistered) {
      throw new ConflictException(
        "Professional with same email already exists.",
      );
    }

    if (cpfAlreadyRegistered) {
      throw new ConflictException("Professional with same CPF already exists.");
    }

    const hashedPassword = await hash(password, 8);

    try {
      let professionalCreated: Professional | null = null;
      if (unityBounded) {
        professionalCreated = await this.prisma.professional.create({
          data: {
            name,
            email,
            cpf,
            phone,
            role,
            birthDate,
            status,
            password: hashedPassword,
            boundedTo,
            establishmentBounded,
            unityBounded,
            regionalDocument,
            regionalDocumentType,
            stateDocumentIssued,
            especiality,
          },
        });
      } else {
        professionalCreated = await this.prisma.professional.create({
          data: {
            name,
            email,
            cpf,
            phone,
            role,
            birthDate,
            status,
            password: hashedPassword,
            boundedTo,
            establishmentBounded,
            regionalDocument,
            regionalDocumentType,
            stateDocumentIssued,
            especiality,
          },
        });
      }

      const isAddressEmpty = Object.keys(addressData).length === 0;

      if (!isAddressEmpty) {
        const resideAddress = await this.prisma.address.create({
          data: {
            street: addressData.street,
            number: addressData.number,
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            postCode: addressData.postCode,
            compliment: addressData.compliment,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          },
        });

        await this.prisma.professional.update({
          where: {
            id: professionalCreated.id,
          },
          data: {
            professionalAddress: resideAddress.id,
          },
        });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to create professional: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
