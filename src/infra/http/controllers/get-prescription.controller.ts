import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Query,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

import { PrismaService } from "@/infra/database/prisma/prisma.service";
import {
  type Address,
  type Customer,
  type Pet,
  type Prescription,
} from "@prisma/client";

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetPrescriptionController {
  constructor(private prisma: PrismaService) {}

  @Get("/prescriptions")
  @HttpCode(200)
  async handle(@Query("id") id?: string, @Query("from") from?: string) {
    if (!id) {
      let allPrescriptions: Prescription[] | null = null;

      if (from) {
        // switch (from) {
        //   case 'establishment': {
        //     //
        //     break
        //   }
        //   default: {
        //     //
        //   }
        // }
        // allPrescriptions = await this.prisma.customer.findMany({
        //   where: {
        //     customerEstablishment: fromEstablishment,
        //   },
        // })
      } else {
        // allPrescriptions = await this.prisma.prescription.findMany()
      }

      allPrescriptions = await this.prisma.prescription.findMany();

      if (!allPrescriptions) {
        throw new NotFoundException("No prescription found");
      }

      if (allPrescriptions) {
        const prescriptionsListPromises = allPrescriptions.map(
          async (prescription) => {
            const medicinePrescribedList =
              await this.prisma.prescriptionHasMedicine.findMany({
                where: { prescriptionId: prescription.id },
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

            const establishmentFound =
              await this.prisma.establishment.findUnique({
                where: { id: prescription.establishmentPrescription },
              });

            const establishmentAddressIdFound =
              establishmentFound?.establishmentAddress;

            let establishmentAddressFound: Address | null = null;

            if (establishmentAddressIdFound) {
              establishmentAddressFound = await this.prisma.address.findUnique({
                where: { id: establishmentAddressIdFound },
              });
            }

            const professionalFound = await this.prisma.professional.findUnique(
              {
                where: { id: prescription.professionalPrescription },
              },
            );

            let patientFound: Customer | null = null;
            let tutorFound: Customer | null = null;
            let petFound: Pet | null = null;

            if (
              prescription.prescriptionType === "MEDIC" &&
              prescription.patientPrescription
            ) {
              patientFound = await this.prisma.customer.findUnique({
                where: { id: prescription.patientPrescription },
              });
            } else if (
              prescription.prescriptionType === "VETERINARY" &&
              prescription.tutorPrescription &&
              prescription.petPrescription
            ) {
              tutorFound = await this.prisma.customer.findUnique({
                where: { id: prescription.tutorPrescription },
              });

              petFound = await this.prisma.pet.findUnique({
                where: { id: prescription.petPrescription },
              });
            }

            return {
              id: prescription.id,
              emissionDate: prescription.emissionDate,
              expirationDate: prescription.expirationDate,
              observation: prescription.observation,

              establishmentPrescription: prescription.establishmentPrescription,
              establishmentName: establishmentFound?.name,
              establishmentAddress: establishmentAddressFound,

              patientPrescription: prescription.patientPrescription,
              patientName: patientFound?.name,
              patientCpf: patientFound?.cpf,
              patientDocument: patientFound?.otherDocument,

              tutorPrescription: prescription.tutorPrescription,
              tutorName: tutorFound?.name,
              tutorCpf: tutorFound?.cpf,
              tutorDocument: tutorFound?.otherDocument,

              petPrescription: prescription.petPrescription,
              petName: petFound?.petName,
              petSpecie: petFound?.specie,

              professionalPrescription: prescription.professionalPrescription,
              professionalName: professionalFound?.name,
              professionalCpf: professionalFound?.cpf,

              medicinePrescribedList: medicinePrescribedListResolved,
            };
          },
        );
        const prescriptionList = await Promise.all(prescriptionsListPromises);

        return prescriptionList;
      }
    }

    const prescriptionFoundById = await this.prisma.prescription.findUnique({
      where: {
        id,
      },
    });

    if (!prescriptionFoundById) {
      throw new NotFoundException("Prescription not found");
    }

    if (prescriptionFoundById) {
      const medicinePrescribedList =
        await this.prisma.prescriptionHasMedicine.findMany({
          where: { prescriptionId: prescriptionFoundById.id },
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

      const establishmentFound = await this.prisma.establishment.findUnique({
        where: { id: prescriptionFoundById.establishmentPrescription },
      });

      const establishmentAddressIdFound =
        establishmentFound?.establishmentAddress;

      let establishmentAddressFound: Address | null = null;

      if (establishmentAddressIdFound) {
        establishmentAddressFound = await this.prisma.address.findUnique({
          where: { id: establishmentAddressIdFound },
        });
      }
      const professionalFound = await this.prisma.professional.findUnique({
        where: { id: prescriptionFoundById.professionalPrescription },
      });

      let patientFound: Customer | null = null;
      let tutorFound: Customer | null = null;
      let petFound: Pet | null = null;

      if (
        prescriptionFoundById.prescriptionType === "MEDIC" &&
        prescriptionFoundById.patientPrescription
      ) {
        patientFound = await this.prisma.customer.findUnique({
          where: { id: prescriptionFoundById.patientPrescription },
        });
      } else if (
        prescriptionFoundById.prescriptionType === "VETERINARY" &&
        prescriptionFoundById.tutorPrescription &&
        prescriptionFoundById.petPrescription
      ) {
        tutorFound = await this.prisma.customer.findUnique({
          where: { id: prescriptionFoundById.tutorPrescription },
        });

        petFound = await this.prisma.pet.findUnique({
          where: { id: prescriptionFoundById.petPrescription },
        });
      }

      return {
        id: prescriptionFoundById.id,
        emissionDate: prescriptionFoundById.emissionDate,
        expirationDate: prescriptionFoundById.expirationDate,
        observation: prescriptionFoundById.observation,
        prescriptionType: prescriptionFoundById.prescriptionType,

        establishmentPrescription:
          prescriptionFoundById.establishmentPrescription,
        establishmentName: establishmentFound?.name,
        establishmentAddress: establishmentAddressFound,

        patientPrescription: prescriptionFoundById.patientPrescription,
        patientName: patientFound?.name,
        patientCpf: patientFound?.cpf,
        patientDocument: patientFound?.otherDocument,

        tutorPrescription: prescriptionFoundById.tutorPrescription,
        tutorName: tutorFound?.name,
        tutorCpf: tutorFound?.cpf,
        tutorDocument: tutorFound?.otherDocument,

        petPrescription: prescriptionFoundById.petPrescription,
        petName: petFound?.petName,
        petSpecie: petFound?.specie,

        professionalPrescription:
          prescriptionFoundById.professionalPrescription,
        professionalName: professionalFound?.name,
        professionalCpf: professionalFound?.cpf,

        medicinePrescribedList: medicinePrescribedListResolved,
      };
    }
  }
}
