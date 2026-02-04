import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { PrescriptionService } from "@/infra/http/controllers/prescription/prescription.service";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import type {
  Address,
  Customer,
  Pet,
  RegionalDocumentType,
} from "@prisma/client";
import { formatDate } from "@/core/formatters/date";

export interface ResponseAddress {
  id: string;
  postCode?: string | null;
  street?: string | null;
  number?: number | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  compliment?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface MedicinePrescribedType {
  medicineId: string;
  medicineName?: string;
  administrationWay: string;
  dosage: string;
  totalAmount: string;
  prescriptionId: string;
}

export interface PrescriptionPdfDataType {
  emissionDate?: string;
  expirationDate?: string;
  observation?: string;
  prescriptionType?: string;

  establishmentName?: string;
  establishmentPhone?: string;
  establishmentAddress?: ResponseAddress;

  patientName?: string;
  tutorName?: string;

  petName?: string;
  petSpecie?: string;

  professionalName?: string;
  professionalPhone?: string;
  professionalDocument?: string;
  professionalDocumentType?: string;

  medicinePrescribedList?: MedicinePrescribedType[];
}

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetPrescriptionPdfController {
  constructor(
    private prescriptionService: PrescriptionService,
    private prisma: PrismaService,
  ) {}

  @Get("/prescriptions/pdf")
  @HttpCode(200)
  async handle(@Res() res: Response, @Query("id") id?: string) {
    if (id) {
      const prescriptionFound = await this.prisma.prescription.findUnique({
        where: { id },
      });

      if (!prescriptionFound) {
        throw new NotFoundException("Prescription not found");
      }

      if (prescriptionFound.pdfBuffer) {
        const pdfBuffer = prescriptionFound.pdfBuffer;

        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=prescription.pdf",
          "Content-Length": pdfBuffer.length,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: 0,
        });
        res.end(pdfBuffer);
      } else {
        let prescription: PrescriptionPdfDataType | null = null;

        if (prescriptionFound) {
          const medicinePrescribedList =
            await this.prisma.prescriptionHasMedicine.findMany({
              where: { prescriptionId: prescriptionFound.id },
            });

          const medicinePrescribedListPromises = medicinePrescribedList.map(
            async (medicinePrescribed) => {
              const medicineFound = await this.prisma.medicine.findUnique({
                where: { id: medicinePrescribed.medicineId },
              });

              return {
                ...medicinePrescribed,
                medicineName: medicineFound?.name,
              };
            },
          );

          const medicinePrescribedListResolved = await Promise.all(
            medicinePrescribedListPromises,
          );

          const establishmentFound = await this.prisma.establishment.findUnique(
            {
              where: { id: prescriptionFound.establishmentPrescription },
            },
          );

          const establishmentAddressIdFound =
            establishmentFound?.establishmentAddress;

          let establishmentAddressFound: Address | null = null;

          if (establishmentAddressIdFound) {
            establishmentAddressFound = await this.prisma.address.findUnique({
              where: { id: establishmentAddressIdFound },
            });
          }

          const professionalFound = await this.prisma.professional.findUnique({
            where: { id: prescriptionFound.professionalPrescription },
          });

          let regionalDocumentTypeFound: RegionalDocumentType | null = null;

          if (professionalFound?.regionalDocumentType) {
            regionalDocumentTypeFound =
              await this.prisma.regionalDocumentType.findUnique({
                where: { id: professionalFound.regionalDocumentType },
              });
          }

          let patientFound: Customer | null = null;
          let tutorFound: Customer | null = null;
          let petFound: Pet | null = null;

          if (
            prescriptionFound.prescriptionType === "MEDIC" &&
            prescriptionFound.patientPrescription
          ) {
            patientFound = await this.prisma.customer.findUnique({
              where: { id: prescriptionFound.patientPrescription },
            });
          } else if (
            prescriptionFound.prescriptionType === "VETERINARY" &&
            prescriptionFound.tutorPrescription &&
            prescriptionFound.petPrescription
          ) {
            tutorFound = await this.prisma.customer.findUnique({
              where: { id: prescriptionFound.tutorPrescription },
            });

            petFound = await this.prisma.pet.findUnique({
              where: { id: prescriptionFound.petPrescription },
            });
          }

          prescription = {
            emissionDate: formatDate(prescriptionFound.emissionDate),
            expirationDate: formatDate(prescriptionFound.expirationDate),
            observation: prescriptionFound.observation || undefined,

            establishmentName: establishmentFound?.name,
            establishmentPhone: establishmentFound?.mainPhone,
            establishmentAddress: establishmentAddressFound || undefined,
            prescriptionType: prescriptionFound.prescriptionType,

            patientName: patientFound?.name,
            tutorName: tutorFound?.name,
            petName: petFound?.petName,
            petSpecie: petFound?.specie,

            professionalName: professionalFound?.name,
            professionalPhone: professionalFound?.phone,
            professionalDocument:
              professionalFound?.regionalDocument || undefined,
            professionalDocumentType: regionalDocumentTypeFound?.abbreviation,

            medicinePrescribedList: medicinePrescribedListResolved,
          };
        }

        try {
          let buffer: Buffer | null = null;

          if (prescription) {
            buffer = await this.prescriptionService.generatePDF(prescription);
          } else {
            throw new NotFoundException("Prescription data not found");
          }

          if (!buffer) {
            throw new InternalServerErrorException(
              "Error generating prescription pdf",
            );
          }

          await this.prisma.prescription.update({
            where: { id },
            data: { pdfBuffer: buffer },
          });

          res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=prescription.pdf",
            "Content-Length": buffer.length,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: 0,
          });
          res.end(buffer);
        } catch (error) {
          throw new InternalServerErrorException(
            "Error generating prescription pdf",
          );
        }
      }
    } else {
      throw new BadRequestException("Prescription id was not provided");
    }
  }
}
