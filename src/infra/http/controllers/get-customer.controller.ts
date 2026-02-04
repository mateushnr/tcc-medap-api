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
import type { Customer } from "@prisma/client";

interface CustomerWithResponsibles extends Customer {
  patientResponsibleList: string[];
}

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetCustomerController {
  constructor(private prisma: PrismaService) {}

  @Get("/customers")
  @HttpCode(200)
  async handle(
    @Query("id") id?: string,
    @Query("type") type?: string,
    @Query("fromEstablishment") fromEstablishment?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize = 6,
    @Query("search") search?: string,
  ) {
    let skip: number | null = null;

    if (page) {
      skip = (page - 1) * pageSize;
    }

    if (!id) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const whereOptions: any = {};
      let searchOptions: any = {};

      if (type) {
        switch (type) {
          case "patient":
            whereOptions.isPatient = true;
            break;
          case "responsible":
            whereOptions.isResponsible = true;
            break;
          case "tutor":
            whereOptions.isTutor = true;
            break;
        }
      }

      if (fromEstablishment) {
        whereOptions.customerEstablishment = fromEstablishment;
      }

      if (search) {
        whereOptions.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { otherDocument: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search, mode: "insensitive" } },
          { cns: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { mainPhone: { contains: search, mode: "insensitive" } },
        ];
      }

      searchOptions = {
        where: whereOptions,
      };

      if (page) {
        searchOptions.skip = skip;
        searchOptions.take = pageSize;
      }

      const [allCustomers, totalCount] = await this.prisma.$transaction([
        this.prisma.customer.findMany(searchOptions),
        this.prisma.customer.count({ where: whereOptions }),
      ]);

      if (!allCustomers) {
        throw new NotFoundException("No customer found");
      }

      if (allCustomers) {
        const customersListPromises = allCustomers.map(async (customer) => {
          const establishmentBounded =
            await this.prisma.establishment.findUnique({
              where: { id: customer.customerEstablishment },
            });

          return {
            id: customer.id,
            name: customer.name,
            cpf: customer.cpf,
            email: customer.email,
            cns: customer.cns,
            otherDocument: customer.otherDocument,
            birthDate: customer.birthDate,
            mainPhone: customer.mainPhone,
            secondaryPhone: customer.secondaryPhone,
            isPatient: customer.isPatient,
            isResponsible: customer.isResponsible,
            isTutor: customer.isTutor,
            status: customer.status,
            customerEstablishment: customer.customerEstablishment,
            customerEstablishmentName: establishmentBounded?.name,
            customerEstablishmentAbbreviation:
              establishmentBounded?.abbreviation,
          };
        });
        const customersList = await Promise.all(customersListPromises);

        if (page) {
          return { data: customersList, totalCount };
        }

        return customersList;
      }
    }

    if (id) {
      const customerFoundById = await this.prisma.customer.findUnique({
        where: {
          id,
        },
      });

      let customerFoundByIdData: CustomerWithResponsibles | any = {
        ...customerFoundById,
      };

      if (customerFoundById?.customerAddress) {
        const customerAddress = await this.prisma.address.findUnique({
          where: {
            id: customerFoundById.customerAddress,
          },
        });

        const customerResponsibleList =
          await this.prisma.patientHasResponsibles.findMany({
            where: {
              responsibleId: customerFoundById.id,
            },
          });

        const patientResponsibleList = customerResponsibleList.map(
          (responsible) => responsible.patientId,
        );

        customerFoundByIdData = {
          ...customerFoundById,
          ...customerAddress,
          patientResponsibleList,
        };
      }

      if (!customerFoundById) {
        throw new NotFoundException("Customer not found");
      }

      return customerFoundByIdData;
    }
  }
}
