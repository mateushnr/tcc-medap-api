import {
  Controller,
  Post,
  HttpCode,
  Body,
  ConflictException,
  UsePipes,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { Prisma, type Customer } from "@prisma/client";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

export interface Pet {
  petName: string;
  specie: string;
  breed?: string;
  age?: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  sex: "MALE" | "FEMALE";
  status: string;
}

const petSchema = z.object({
  petName: z.string(),
  specie: z.string(),
  breed: z.string().optional(),
  age: z.string().optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  sex: z.enum(["MALE", "FEMALE"]),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
});

const createCustomerBodySchema = z.object({
  name: z.string(),
  cpf: z.string().optional(),
  otherDocument: z.string().optional(),
  email: z.string().optional(),
  cns: z.string().optional(),
  birthDate: z.string().optional(),
  mainPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  isPatient: z.boolean(),
  isResponsible: z.boolean(),
  isTutor: z.boolean(),
  status: z.enum(["ACTIVE", "DEACTIVATED"]),
  establishmentBounded: z.string().uuid(),
  postCode: z.string().optional(),
  street: z.string().optional(),
  number: z.coerce.number().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  compliment: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  patientsResponsibleIdList: z.array(z.string()).optional(),
  petsList: z.array(petSchema).optional(),
});

type CreateCustomerBodySchema = z.infer<typeof createCustomerBodySchema>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreateCustomerController {
  constructor(private prisma: PrismaService) {}

  @Post("/customers")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createCustomerBodySchema))
  async handle(@Body() body: CreateCustomerBodySchema) {
    const {
      name,
      cpf,
      email,
      cns,
      otherDocument,
      birthDate,
      mainPhone,
      secondaryPhone,
      isPatient,
      isResponsible,
      isTutor,
      status,
      establishmentBounded,
      patientsResponsibleIdList,
      petsList,
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

    const nameAlreadyRegistered = await this.prisma.customer.findFirst({
      where: {
        AND: [
          {
            name,
          },
          {
            customerEstablishment: establishmentToRegister.id,
          },
        ],
      },
    });

    if (nameAlreadyRegistered) {
      throw new ConflictException("Customer with same email already exists.");
    }

    if (cpf) {
      const cpfAlreadyRegistered = await this.prisma.customer.findFirst({
        where: {
          AND: [
            {
              cpf,
            },
            {
              customerEstablishment: establishmentToRegister.id,
            },
          ],
        },
      });

      if (cpfAlreadyRegistered) {
        throw new ConflictException("Customer with same CPF already exists.");
      }
    }

    if (otherDocument) {
      const otherDocumentAlreadyRegistered =
        await this.prisma.customer.findFirst({
          where: {
            AND: [
              {
                otherDocument,
              },
              {
                customerEstablishment: establishmentToRegister.id,
              },
            ],
          },
        });

      if (otherDocumentAlreadyRegistered) {
        throw new ConflictException(
          "Customer with same document already exists.",
        );
      }
    }

    try {
      let customerCreated: Customer | null = null;

      customerCreated = await this.prisma.customer.create({
        data: {
          name,
          cpf,
          email,
          cns,
          otherDocument,
          birthDate,
          mainPhone,
          secondaryPhone,
          isPatient,
          isResponsible,
          isTutor,
          status,
          customerEstablishment: establishmentBounded,
        },
      });

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

        if (customerCreated) {
          await this.prisma.customer.update({
            where: {
              id: customerCreated.id,
            },
            data: {
              customerAddress: resideAddress.id,
            },
          });
        }
      }

      const customerCreatedId: string = customerCreated.id;

      if (patientsResponsibleIdList && customerCreatedId) {
        patientsResponsibleIdList.forEach(async (idPatient) => {
          await this.prisma.patientHasResponsibles.create({
            data: {
              patientId: idPatient,
              responsibleId: customerCreatedId,
            },
          });
        });
      }

      if (petsList && petsList?.length > 0 && customerCreatedId) {
        petsList.forEach(async (pet) => {
          await this.prisma.pet.create({
            data: {
              ...pet,
              establishmentRegistered: establishmentBounded,
              customerOwner: customerCreatedId,
            },
          });
        });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to create customer: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
