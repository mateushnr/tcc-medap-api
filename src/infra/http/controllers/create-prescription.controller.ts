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
import { Prisma, type Prescription } from "@prisma/client";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

const createPrescriptionBodySchema = z.object({
  emissionDate: z.string(),
  expirationDate: z.string(),
  observation: z.string().optional(),
  establishmentPrescription: z.string(),
  patientPrescription: z.string().optional(),
  professionalPrescription: z.string(),
  tutorPrescription: z.string().optional(),
  petPrescription: z.string().optional(),
  prescriptionType: z.enum(["MEDIC", "VETERINARY"]),

  medicinesPrescribedList: z
    .array(
      z.object({
        medicineId: z.string(),
        dosage: z.string(),
        totalAmount: z.string(),
        administrationWay: z.enum([
          "ORAL",
          "SUBLINGUAL",
          "BUCAL",
          "RETAL",
          "VAGINAL",
          "INTRAVENOSA",
          "INTRAMUSCULAR",
          "SUBCUTANEA",
          "INTRADERMICA",
          "INALATORIA",
          "NASALOFTALMICA",
          "OTOLOGICA",
          "TOPICA",
          "TRANSDERMICA",
          "INTRA_ARTICULAR",
          "INTRAPERITONEAL",
          "EPIDURAL",
          "INTRATECAL",
          "INTRACARDIACA",
          "URETRAL",
        ]),
      }),
    )
    .optional(),
});

type CreatePrescriptionBodySchema = z.infer<
  typeof createPrescriptionBodySchema
>;

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class CreatePrescriptionController {
  constructor(private prisma: PrismaService) {}

  @Post("/prescriptions")
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createPrescriptionBodySchema))
  async handle(@Body() body: CreatePrescriptionBodySchema) {
    const {
      emissionDate,
      expirationDate,
      observation,
      petPrescription,
      tutorPrescription,
      prescriptionType,
      establishmentPrescription,
      patientPrescription,
      professionalPrescription,
      medicinesPrescribedList,
    } = body;

    const prescriptionToRegister = await this.prisma.establishment.findUnique({
      where: {
        id: establishmentPrescription,
      },
    });

    if (!prescriptionToRegister) {
      throw new ConflictException("Establishment to register does not exists.");
    }

    const professionalToRegister = await this.prisma.professional.findUnique({
      where: {
        id: professionalPrescription,
      },
    });

    if (!professionalToRegister) {
      throw new ConflictException("Professional to register does not exists.");
    }

    if (prescriptionType === "MEDIC") {
      const patientToRegister = await this.prisma.customer.findUnique({
        where: {
          id: patientPrescription,
        },
      });

      if (!patientToRegister) {
        throw new ConflictException("Patient to register does not exists.");
      }
    } else {
      const tutorToRegister = await this.prisma.customer.findUnique({
        where: {
          id: tutorPrescription,
        },
      });

      if (!tutorToRegister) {
        throw new ConflictException("Tutor to register does not exists.");
      }

      const petToRegister = await this.prisma.pet.findUnique({
        where: {
          id: petPrescription,
        },
      });

      if (!petToRegister) {
        throw new ConflictException("Pet to register does not exists.");
      }
    }

    try {
      let prescriptionCreated: Prescription | null = null;

      prescriptionCreated = await this.prisma.prescription.create({
        data: {
          prescriptionType,
          petPrescription: petPrescription || undefined,
          tutorPrescription: tutorPrescription || undefined,
          emissionDate,
          expirationDate,
          observation,
          establishmentPrescription,
          patientPrescription: patientPrescription || undefined,
          professionalPrescription,
        },
      });

      const prescriptionCreatedId: string = prescriptionCreated.id;

      if (medicinesPrescribedList && prescriptionCreatedId) {
        medicinesPrescribedList.forEach(async (medicinePrescribed) => {
          await this.prisma.prescriptionHasMedicine.create({
            data: {
              prescriptionId: prescriptionCreatedId,
              medicineId: medicinePrescribed.medicineId,
              dosage: medicinePrescribed.dosage,
              totalAmount: medicinePrescribed.totalAmount,
              administrationWay: medicinePrescribed.administrationWay,
            },
          });
        });
      }

      return { prescriptionCreatedId };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          "Failed to create prescription: " + error.message,
        );
      } else {
        throw error;
      }
    }
  }
}
