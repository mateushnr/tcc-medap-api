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
import type { Professional } from "@prisma/client";

@Controller("/api")
@UseGuards(JwtAuthGuard)
export class GetProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Get("/professionals")
  @HttpCode(200)
  async handle(
    @Query("id") id?: string,
    @Query("fromEstablishment") fromEstablishment?: string,
    @Query("isHealthProfessional") isHealthProfessional?: boolean,
    @Query("page") page?: number,
    @Query("pageSize") pageSize = 6,
    @Query("search") search?: string,
  ) {
    let skip: number | null = null;

    if (page) {
      skip = (page - 1) * pageSize;
    }

    if (!id) {
      if (!fromEstablishment) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const whereOptions: any = {};
        let searchOptions: any = {};

        if (search) {
          whereOptions.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { regionalDocument: { contains: search, mode: "insensitive" } },
            { especiality: { contains: search, mode: "insensitive" } },
          ];
        }

        searchOptions = {
          where: whereOptions,
        };

        if (page) {
          searchOptions.skip = skip;
          searchOptions.take = pageSize;
        }

        const [allProfessionals, totalCount] = await this.prisma.$transaction([
          this.prisma.professional.findMany(searchOptions),
          this.prisma.professional.count({ where: whereOptions }),
        ]);

        if (!allProfessionals) {
          throw new NotFoundException("No professional found");
        }

        if (allProfessionals) {
          const professionalsListPromises = allProfessionals.map(
            async (professional) => {
              const establishmentBounded =
                await this.prisma.establishment.findUnique({
                  where: { id: professional.establishmentBounded },
                });

              return {
                id: professional.id,
                name: professional.name,
                email: professional.email,
                cpf: professional.cpf,
                phone: professional.phone,
                especiality: professional.especiality,
                role: professional.role,
                birthDate: professional.birthDate,
                status: professional.status,
                boundedTo: professional.boundedTo,
                regionalDocumentType: professional.regionalDocumentType,
                regionalDocument: professional.regionalDocument,
                stateDocumentIssued: professional.stateDocumentIssued,
                establishmentBoundedName: establishmentBounded?.name,
                establishmentBoundedAbbreviation:
                  establishmentBounded?.abbreviation,
              };
            },
          );
          const professionalsList = await Promise.all(
            professionalsListPromises,
          );

          if (page) {
            return { data: professionalsList, totalCount };
          }

          return professionalsList;
        }
      }

      let allProfessionals: Professional[] | null = null;

      if (fromEstablishment) {
        if (isHealthProfessional) {
          allProfessionals = await this.prisma.professional.findMany({
            where: {
              establishmentBounded: fromEstablishment,
              NOT: {
                regionalDocument: undefined,
              },
            },
          });
        } else {
          allProfessionals = await this.prisma.professional.findMany({
            where: {
              establishmentBounded: fromEstablishment,
            },
          });
        }
      } else {
        if (isHealthProfessional) {
          allProfessionals = await this.prisma.professional.findMany({
            where: {
              NOT: {
                regionalDocument: undefined,
              },
            },
          });
        } else {
          allProfessionals = await this.prisma.professional.findMany();
        }
      }

      if (!allProfessionals) {
        throw new NotFoundException("No professional found");
      }

      const professionalsListPromises = allProfessionals.map(
        async (professional) => {
          const establishmentBounded =
            await this.prisma.establishment.findUnique({
              where: { id: professional.establishmentBounded },
            });

          return {
            id: professional.id,
            name: professional.name,
            email: professional.email,
            cpf: professional.cpf,
            phone: professional.phone,
            especiality: professional.especiality,
            role: professional.role,
            birthDate: professional.birthDate,
            status: professional.status,
            boundedTo: professional.boundedTo,
            regionalDocumentType: professional.regionalDocumentType,
            regionalDocument: professional.regionalDocument,
            stateDocumentIssued: professional.stateDocumentIssued,
            establishmentBoundedName: establishmentBounded?.name,
            establishmentBoundedAbbreviation:
              establishmentBounded?.abbreviation,
          };
        },
      );
      const professionalsList = await Promise.all(professionalsListPromises);

      return professionalsList;
    }

    const professionalFoundById = await this.prisma.professional.findUnique({
      where: {
        id,
      },
    });

    let professionalFoundByIdData = {
      id: professionalFoundById?.id,
      name: professionalFoundById?.name,
      email: professionalFoundById?.email,
      cpf: professionalFoundById?.cpf,
      phone: professionalFoundById?.phone,
      especiality: professionalFoundById?.especiality,
      role: professionalFoundById?.role,
      birthDate: professionalFoundById?.birthDate,
      status: professionalFoundById?.status,
      boundedTo: professionalFoundById?.boundedTo,
      regionalDocumentType: professionalFoundById?.regionalDocumentType,
      regionalDocument: professionalFoundById?.regionalDocument,
      stateDocumentIssued: professionalFoundById?.stateDocumentIssued,
      establishmentBounded: professionalFoundById?.establishmentBounded,
      unityBounded: professionalFoundById?.unityBounded,
      professionalAddress: professionalFoundById?.professionalAddress,
    };

    if (professionalFoundById?.professionalAddress) {
      const professionalAddress = await this.prisma.address.findUnique({
        where: {
          id: professionalFoundById.professionalAddress,
        },
      });

      professionalFoundByIdData = {
        ...professionalFoundByIdData,
        ...professionalAddress,
      };
    }

    if (!professionalFoundById) {
      throw new NotFoundException("Professional not found");
    }

    return professionalFoundByIdData;
  }
}
