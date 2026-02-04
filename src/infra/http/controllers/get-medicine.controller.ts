import {
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Query,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import type { Establishment } from "@prisma/client";

interface tokenProps {
  sub: string;
  name: string;
  accessLevel: string;
  establishmentBounded: string;
}

interface RequestHeaders {
  authorization: string;
}

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetMedicinesController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Get("/medicines")
  @HttpCode(200)
  async handle(
    @Headers() headers: RequestHeaders,
    @Query("id") id?: string,
    @Query("availableFor") filterType?: string,
    @Query("page") page?: number,
    @Query("pageSize") pageSize = 6,
    @Query("search") search?: string,
  ) {
    const authorizationHeader = headers.authorization;

    let skip: number | null = null;

    if (page) {
      skip = (page - 1) * pageSize;
    }

    if (!authorizationHeader) {
      throw new UnauthorizedException("Token not found.");
    }

    const token = authorizationHeader.split(" ")[1];

    const decodedToken: tokenProps = this.jwt.decode(token);

    if (!id) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (!filterType) {
        const whereOptions: any = {};
        const searchOptions: any = {};

        if (search) {
          whereOptions.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { activeIngredient: { contains: search, mode: "insensitive" } },
          ];
        }

        searchOptions.where = whereOptions;

        if (page) {
          searchOptions.skip = skip;
          searchOptions.take = pageSize;
        }

        const [allMedicines, totalCount] = await this.prisma.$transaction([
          this.prisma.medicine.findMany(searchOptions),
          this.prisma.medicine.count({ where: whereOptions }),
        ]);

        if (!allMedicines) {
          throw new NotFoundException("No medicine found");
        }

        if (allMedicines) {
          const medicineListPromises = allMedicines.map(async (medicine) => {
            let establishmentRegistered: Establishment | null = null;

            if (medicine.establishmentRegistered) {
              establishmentRegistered =
                await this.prisma.establishment.findUnique({
                  where: {
                    id: medicine.establishmentRegistered || undefined,
                  },
                });
            }

            return {
              id: medicine.id,
              name: medicine.name,
              pharmaceuticalForm: medicine.pharmaceuticalForm,
              regulatoryCategory: medicine.regulatoryCategory,
              activeIngredient: medicine.activeIngredient,
              forUse: medicine.forUse,
              status: medicine.status,
              establishmentRegistered: medicine.establishmentRegistered,
              establishmentRegisteredName: establishmentRegistered?.name,
              establishmentRegisteredAbbreviation:
                establishmentRegistered?.abbreviation,
            };
          });

          const allMedicineList = await Promise.all(medicineListPromises);

          if (page) {
            return { data: allMedicineList, totalCount };
          }

          return allMedicineList;
        }
      }

      switch (filterType) {
        case "establishment": {
          const allDefaultMedicines = await this.prisma.medicine.findMany({
            where: {
              establishmentRegistered: null,
            },
          });

          if (decodedToken.establishmentBounded) {
            const allCustomMedicinesFromEstablishment =
              await this.prisma.medicine.findMany({
                where: {
                  establishmentRegistered: decodedToken.establishmentBounded,
                },
              });

            const medicineListPromises =
              allCustomMedicinesFromEstablishment.map(async (medicine) => {
                const establishmentRegistered =
                  await this.prisma.establishment.findUnique({
                    where: {
                      id: medicine.establishmentRegistered || undefined,
                    },
                  });

                return {
                  id: medicine.id,
                  name: medicine.name,
                  pharmaceuticalForm: medicine.pharmaceuticalForm,
                  regulatoryCategory: medicine.regulatoryCategory,
                  activeIngredient: medicine.activeIngredient,
                  forUse: medicine.forUse,
                  status: medicine.status,
                  establishmentRegistered: medicine.establishmentRegistered,
                  establishmentRegisteredName: establishmentRegistered?.name,
                  establishmentRegisteredAbbreviation:
                    establishmentRegistered?.abbreviation,
                };
              });

            const allMedicineList = await Promise.all(medicineListPromises);

            const allMedicines = allDefaultMedicines.concat(allMedicineList);

            return allMedicines;
          }

          return allDefaultMedicines;
        }
        case "all": {
          let searchOptions = {};

          if (page) {
            searchOptions = {
              skip,
              take: pageSize,
            };
          }

          const allMedicines =
            await this.prisma.medicine.findMany(searchOptions);

          const totalCount = (await this.prisma.medicine.findMany()).length;

          const medicinesListPromises = allMedicines.map(async (medicine) => {
            let establishmentRegistered: Establishment | null = null;

            if (medicine.establishmentRegistered) {
              establishmentRegistered =
                await this.prisma.establishment.findUnique({
                  where: {
                    id: medicine?.establishmentRegistered || undefined,
                  },
                });
            }

            return {
              id: medicine.id,
              name: medicine.name,
              pharmaceuticalForm: medicine.pharmaceuticalForm,
              regulatoryCategory: medicine.regulatoryCategory,
              activeIngredient: medicine.activeIngredient,
              forUse: medicine.forUse,
              status: medicine.status,
              establishmentRegistered: medicine.establishmentRegistered,
              establishmentRegisteredName: establishmentRegistered?.name,
              establishmentRegisteredAbbreviation:
                establishmentRegistered?.abbreviation,
            };
          });

          const allMedicinesList = await Promise.all(medicinesListPromises);

          if (page) {
            return { data: allMedicinesList, totalCount };
          }

          return allMedicinesList;
        }

        default: {
          const allDefaultMedicines = await this.prisma.medicine.findMany({
            where: {
              establishmentRegistered: null,
            },
          });

          if (decodedToken.establishmentBounded) {
            const allCustomMedicinesFromEstablishment =
              await this.prisma.medicine.findMany({
                where: {
                  NOT: {
                    establishmentRegistered: null,
                  },
                },
              });

            const medicinesListPromises =
              allCustomMedicinesFromEstablishment.map(async (medicine) => {
                const establishmentRegistered =
                  await this.prisma.establishment.findUnique({
                    where: {
                      id: medicine.establishmentRegistered || undefined,
                    },
                  });

                return {
                  id: medicine.id,
                  name: medicine.name,
                  pharmaceuticalForm: medicine.pharmaceuticalForm,
                  regulatoryCategory: medicine.regulatoryCategory,
                  activeIngredient: medicine.activeIngredient,
                  forUse: medicine.forUse,
                  status: medicine.status,
                  establishmentRegistered: medicine.establishmentRegistered,
                  establishmentRegisteredName: establishmentRegistered?.name,
                  establishmentRegisteredAbbreviation:
                    establishmentRegistered?.abbreviation,
                };
              });

            const allCustomMedicinesList = await Promise.all(
              medicinesListPromises,
            );

            const allMedicines = allDefaultMedicines.concat(
              allCustomMedicinesList,
            );

            return allMedicines;
          }

          return allDefaultMedicines;
        }
      }
    }

    const medicineFoundById = await this.prisma.medicine.findUnique({
      where: {
        id,
      },
    });

    if (!medicineFoundById) {
      throw new NotFoundException("Medicine not found");
    }

    return medicineFoundById;
  }
}
