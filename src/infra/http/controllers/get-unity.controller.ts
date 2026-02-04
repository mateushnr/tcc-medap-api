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

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetUnityController {
  constructor(private prisma: PrismaService) {}

  @Get("/units")
  @HttpCode(200)
  async handle(
    @Query("id") id?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize = 6,
  ) {
    let skip: number | null = null;

    if (page) {
      skip = (page - 1) * pageSize;
    }

    if (!id) {
      let searchOptions = {};

      if (page) {
        searchOptions = {
          skip,
          take: pageSize,
        };
      }

      const allUnits = await this.prisma.unity.findMany(searchOptions);

      const totalCount = await this.prisma.unity.count();

      if (!allUnits) {
        throw new NotFoundException("No unity found");
      }

      const unitsListPromises = allUnits.map(async (unity) => {
        const establishmentBounded = await this.prisma.establishment.findUnique(
          { where: { id: unity.unityEstablishment } },
        );

        return {
          id: unity.id,
          name: unity.name,
          abbreviation: unity.abbreviation,
          cnpj: unity.cnpj,
          type: unity.unityType,
          especiality: unity.especiality,
          mainPhone: unity.mainPhone,
          secondaryPhone: unity.secondaryPhone,
          targetCustomer: unity.targetCustomer,
          email: unity.email,
          establishmentBoundedName: establishmentBounded?.name,
          establishmentBoundedAbbreviation: establishmentBounded?.abbreviation,
          status: unity.status,
        };
      });
      const unitsList = await Promise.all(unitsListPromises);

      if (page) {
        return { data: unitsList, totalCount };
      }
      return unitsList;
    }

    const unityFoundById = await this.prisma.unity.findUnique({
      where: {
        id,
      },
    });

    let unityFoundByIdData = {
      ...unityFoundById,
    };

    if (unityFoundById?.unityAddress) {
      const unityAddress = await this.prisma.address.findUnique({
        where: {
          id: unityFoundById.unityAddress,
        },
      });

      unityFoundByIdData = {
        ...unityFoundById,
        ...unityAddress,
      };
    }

    if (!unityFoundById) {
      throw new NotFoundException("Unity not found");
    }

    return unityFoundByIdData;
  }
}
