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

const updateCustomerBodySchema = z.object({
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
  patientsResponsibleIdListToAdd: z.array(z.string()).optional(),
  patientsResponsibleIdListToRemove: z.array(z.string()).optional(),
  petsList: z.array(petSchema).optional(),
});

type UpdateCustomerBodySchema = z.infer<typeof updateCustomerBodySchema>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class UpdateCustomerController {
  constructor(private prisma: PrismaService) {}

  @Put("/customers")
  @HttpCode(200)
  @UsePipes()
  async handle(
    @Body(new ZodValidationPipe(updateCustomerBodySchema))
    body: UpdateCustomerBodySchema,
    @Query("id") id?: string,
  ) {
    if (!id) {
      throw new BadRequestException("Id was not provided");
    }

    const oldCustomerData = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!oldCustomerData) {
      throw new NotFoundException("Customer not found");
    }

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
      patientsResponsibleIdListToAdd,
      patientsResponsibleIdListToRemove,
      petsList,
      ...addressData
    } = body;

    const nameAlreadyRegistered = await this.prisma.customer.findFirst({
      where: {
        AND: [
          {
            name,
          },
          {
            customerEstablishment: establishmentBounded,
          },
        ],
      },
    });

    const cpfAlreadyRegistered = await this.prisma.customer.findFirst({
      where: {
        AND: [
          {
            cpf,
          },
          {
            customerEstablishment: establishmentBounded,
          },
        ],
      },
    });

    const documentAlreadyRegistered = await this.prisma.customer.findFirst({
      where: {
        AND: [
          {
            otherDocument,
          },
          {
            customerEstablishment: establishmentBounded,
          },
        ],
      },
    });

    if (
      nameAlreadyRegistered &&
      email !== oldCustomerData.email &&
      email !== ""
    ) {
      throw new ConflictException("Customer with same name already exists.");
    }

    if (cpfAlreadyRegistered && cpf !== oldCustomerData.cpf && cpf !== "") {
      throw new ConflictException("Customer with same cpf already exists.");
    }

    if (
      documentAlreadyRegistered &&
      otherDocument !== oldCustomerData.otherDocument &&
      otherDocument !== ""
    ) {
      throw new ConflictException(
        "Customer with same document already exists.",
      );
    }

    let newAddressId: string | null = null;

    if (oldCustomerData.customerAddress) {
      const customerAddressOldData = await this.prisma.address.findUnique({
        where: { id: oldCustomerData.customerAddress },
      });
      if (
        addressData.postCode !== customerAddressOldData?.postCode ||
        addressData.street !== customerAddressOldData?.postCode ||
        addressData.number !== customerAddressOldData?.postCode ||
        addressData.neighborhood !== customerAddressOldData?.postCode ||
        addressData.city !== customerAddressOldData?.postCode ||
        addressData.state !== customerAddressOldData?.postCode ||
        addressData.compliment !== customerAddressOldData?.postCode ||
        addressData.latitude !== customerAddressOldData?.postCode ||
        addressData.longitude !== customerAddressOldData?.postCode
      ) {
        const customerAddressUpdated = await this.prisma.address.update({
          where: { id: oldCustomerData.customerAddress },
          data: {
            postCode: addressData.postCode,
            street: addressData.street,
            number: addressData.number,
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            compliment: addressData.compliment,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          },
        });

        if (!customerAddressUpdated) {
          throw new BadRequestException("Error during customer address update");
        }
      }
    } else {
      if (
        addressData.postCode ||
        addressData.street ||
        addressData.number ||
        addressData.neighborhood ||
        addressData.city ||
        addressData.state ||
        addressData.compliment ||
        addressData.latitude ||
        addressData.longitude
      ) {
        const newCustomerAddress = await this.prisma.address.create({
          data: {
            postCode: addressData.postCode,
            street: addressData.street,
            number: addressData.number,
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            compliment: addressData.compliment,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          },
        });

        if (!newCustomerAddress) {
          throw new BadRequestException("Error during customer address update");
        }

        newAddressId = newCustomerAddress.id;
      }
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */

    try {
      const updateData: any = {
        name,
        email,
        cpf,
        cns,
        otherDocument,
        birthDate,
        status,
        mainPhone,
        secondaryPhone,
        isPatient,
        isResponsible,
        isTutor,
        ...(newAddressId && { customerAddress: newAddressId }),
      };

      const customerUpdated = await this.prisma.customer.update({
        where: { id },
        data: updateData,
      });

      if (!customerUpdated) {
        throw new BadRequestException("Error during customer update");
      }

      if (patientsResponsibleIdListToAdd && customerUpdated) {
        patientsResponsibleIdListToAdd.forEach(async (idPatient) => {
          await this.prisma.patientHasResponsibles.create({
            data: {
              patientId: idPatient,
              responsibleId: customerUpdated.id,
            },
          });
        });
      }

      if (patientsResponsibleIdListToRemove && customerUpdated) {
        await Promise.all(
          patientsResponsibleIdListToRemove.map(async (idPatient) => {
            await this.prisma.patientHasResponsibles.deleteMany({
              where: {
                patientId: idPatient,
                responsibleId: customerUpdated.id,
              },
            });
          }),
        );
      }

      if (petsList && petsList?.length > 0 && customerUpdated) {
        petsList.forEach(async (pet) => {
          await this.prisma.pet.create({
            data: {
              ...pet,
              establishmentRegistered: establishmentBounded,
              customerOwner: customerUpdated.id,
            },
          });
        });
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
