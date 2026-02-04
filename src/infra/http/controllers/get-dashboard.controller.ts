import { Controller, Get, HttpCode, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

import { PrismaService } from "@/infra/database/prisma/prisma.service";

interface dataLineChartType {
  name: string;
  pacientes: number;
  receitas: number;
}

interface MedicineCount {
  name: string;
  quantidade: number;
}

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetDashboardsController {
  constructor(private prisma: PrismaService) {}

  @Get("/dashboards")
  @HttpCode(200)
  async handle() {
    const currentYear = new Date().getFullYear();

    const dataLineChart: dataLineChartType[] = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 1);

      const patients = await this.prisma.customer.count({
        where: {
          isPatient: true,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const prescriptions = await this.prisma.prescription.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      dataLineChart.push({
        name: startDate
          .toLocaleString("default", { month: "short" })
          .replace(/^./, (str) => str.toUpperCase()),
        pacientes: patients,
        receitas: prescriptions,
      });
    }

    const medicineCounts = await this.prisma.prescriptionHasMedicine.groupBy({
      by: ["medicineId"],
      _count: {
        medicineId: true,
      },
      orderBy: {
        _count: {
          medicineId: "desc",
        },
      },
      take: 10,
    });

    console.log(medicineCounts);
    console.log("-----");

    const dataBarChart: MedicineCount[] = await Promise.all(
      medicineCounts.map(async (medicineCount) => {
        const medicine = await this.prisma.medicine.findUnique({
          where: { id: medicineCount.medicineId },
        });

        return {
          name: medicine?.name || "Unknown",
          quantidade: medicineCount._count.medicineId,
        };
      }),
    );

    console.log(dataBarChart);

    const patientTotalCount = await this.prisma.customer.count({
      where: { isPatient: true },
    });
    const professionalTotalCount = await this.prisma.professional.count();
    const medicineTotalCount = await this.prisma.medicine.count();
    const establishmentTotalCount = await this.prisma.establishment.count();
    const prescriptionTotalCount = await this.prisma.prescription.count();

    return {
      patientTotalCount,
      professionalTotalCount,
      medicineTotalCount,
      establishmentTotalCount,
      prescriptionTotalCount,
      dataLineChart,
      dataBarChart,
    };
  }
}
