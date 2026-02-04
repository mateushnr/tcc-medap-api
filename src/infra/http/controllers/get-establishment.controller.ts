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
import type { Address } from "@prisma/client";

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetEstablishmentController {
  constructor(private prisma: PrismaService) {}

  @Get("/establishments")
  @HttpCode(200)
  async handle(
    @Query("id") id?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize = 6,
    @Query("search") search?: string,
  ) {
    let skip: number | null = null;

    if (page) {
      skip = (page - 1) * pageSize;
    }

    if (!id) {
      let whereOptions = {};
      let searchOptions = {};

      if (page) {
        searchOptions = {
          skip,
          take: pageSize,
        };
      }

      if (search) {
        whereOptions = {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { abbreviation: { contains: search, mode: "insensitive" } },
            { cnpj: { contains: search, mode: "insensitive" } },
            {
              typeEstablishment: {
                name: { contains: search, mode: "insensitive" },
              },
            },
            { especiality: { contains: search, mode: "insensitive" } },
            { mainPhone: { contains: search, mode: "insensitive" } },
            { secondaryPhone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        };

        searchOptions = {
          where: whereOptions,
          skip,
          take: pageSize,
        };
      }

      const [allEstablishments, totalCount] = await this.prisma.$transaction([
        this.prisma.establishment.findMany(searchOptions),
        this.prisma.establishment.count({ where: whereOptions }),
      ]);

      if (!allEstablishments) {
        throw new NotFoundException("No establishment found");
      }

      const establishmentsListPromises = allEstablishments.map(
        async (establishment) => {
          let establishmentAddressFound: Address | null = null;

          if (establishment.establishmentAddress) {
            establishmentAddressFound = await this.prisma.address.findUnique({
              where: { id: establishment.establishmentAddress },
            });
          }

          return {
            id: establishment.id,
            name: establishment.name,
            abbreviation: establishment.abbreviation,
            cnpj: establishment.cnpj,
            establishmentType: establishment.establishmentType,
            especiality: establishment.especiality,
            mainPhone: establishment.mainPhone,
            secondaryPhone: establishment.secondaryPhone,
            targetCustomer: establishment.targetCustomer,
            email: establishment.email,
            status: establishment.status,
            establishmentAddress: establishment.establishmentAddress,

            postCode: establishmentAddressFound?.postCode,
            street: establishmentAddressFound?.street,
            number: establishmentAddressFound?.number,
            neighborhood: establishmentAddressFound?.neighborhood,
            city: establishmentAddressFound?.city,
            state: establishmentAddressFound?.state,
            compliment: establishmentAddressFound?.compliment,
            latitude: establishmentAddressFound?.latitude,
            longitude: establishmentAddressFound?.longitude,
          };
        },
      );
      const allEstablishmentList = await Promise.all(
        establishmentsListPromises,
      );

      if (page) {
        return { data: allEstablishmentList, totalCount };
      }

      return allEstablishmentList;
    }

    const establishmentFoundById = await this.prisma.establishment.findUnique({
      where: {
        id,
      },
    });

    let establishmentFoundByIdData = {
      ...establishmentFoundById,
    };

    if (establishmentFoundById?.establishmentAddress) {
      const establishmentAddress = await this.prisma.address.findUnique({
        where: {
          id: establishmentFoundById.establishmentAddress,
        },
      });

      establishmentFoundByIdData = {
        ...establishmentFoundById,
        ...establishmentAddress,
      };
    }

    if (!establishmentFoundById) {
      throw new NotFoundException("Establishment not found");
    }

    return establishmentFoundByIdData;
  }
}
