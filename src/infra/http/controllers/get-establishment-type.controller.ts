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
export class GetEstablishmentTypeController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Get("/establishments/types")
  @HttpCode(200)
  async handle(
    @Headers() headers: RequestHeaders,
    @Query("id") id?: string,
    @Query("availableFor") filterType?: string,
  ) {
    const authorizationHeader = headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException("Token not found.");
    }

    const token = authorizationHeader.split(" ")[1];

    const decodedToken: tokenProps = this.jwt.decode(token);

    if (!id) {
      switch (filterType) {
        case "establishment": {
          const allDefaultEstablishmentsTypes =
            await this.prisma.establishmentType.findMany({
              where: {
                NOT: {
                  availableFor: "UNITY",
                },

                establishmentRegistered: null,
              },
            });

          if (decodedToken.establishmentBounded) {
            const allCustomEstablishmentsTypesFromEstablishment =
              await this.prisma.establishmentType.findMany({
                where: {
                  NOT: {
                    availableFor: "UNITY",
                  },

                  establishmentRegistered: decodedToken.establishmentBounded,
                },
              });

            const establishmentsTypeListPromises =
              allCustomEstablishmentsTypesFromEstablishment.map(
                async (establishmentType) => {
                  const establishmentRegistered =
                    await this.prisma.establishment.findUnique({
                      where: {
                        id:
                          establishmentType.establishmentRegistered ||
                          undefined,
                      },
                    });

                  return {
                    id: establishmentType.id,
                    name: establishmentType.name,
                    availableFor: establishmentType.availableFor,
                    status: establishmentType.status,
                    establishmentRegistered:
                      establishmentType.establishmentRegistered,
                    establishmentRegisteredName: establishmentRegistered?.name,
                    establishmentRegisteredAbbreviation:
                      establishmentRegistered?.abbreviation,
                  };
                },
              );

            const allCustomEstablishmentTypesList = await Promise.all(
              establishmentsTypeListPromises,
            );

            const allEstablishmentsTypes = allDefaultEstablishmentsTypes.concat(
              allCustomEstablishmentTypesList,
            );

            return allEstablishmentsTypes;
          }

          return allDefaultEstablishmentsTypes;
        }

        case "unity": {
          const allDefaultEstablishmentsTypes =
            await this.prisma.establishmentType.findMany({
              where: {
                NOT: {
                  availableFor: "ESTABLISHMENT",
                },

                establishmentRegistered: null,
              },
            });

          if (decodedToken.establishmentBounded) {
            const allCustomEstablishmentsTypesFromEstablishment =
              await this.prisma.establishmentType.findMany({
                where: {
                  NOT: {
                    availableFor: "ESTABLISHMENT",
                  },

                  establishmentRegistered: decodedToken.establishmentBounded,
                },
              });

            const establishmentsTypeListPromises =
              allCustomEstablishmentsTypesFromEstablishment.map(
                async (establishmentType) => {
                  const establishmentRegistered =
                    await this.prisma.establishment.findUnique({
                      where: {
                        id:
                          establishmentType.establishmentRegistered ||
                          undefined,
                      },
                    });

                  return {
                    id: establishmentType.id,
                    name: establishmentType.name,
                    availableFor: establishmentType.availableFor,
                    status: establishmentType.status,
                    establishmentRegistered:
                      establishmentType.establishmentRegistered,
                    establishmentRegisteredName: establishmentRegistered?.name,
                    establishmentRegisteredAbbreviation:
                      establishmentRegistered?.abbreviation,
                  };
                },
              );

            const allCustomEstablishmentTypesList = await Promise.all(
              establishmentsTypeListPromises,
            );

            const allEstablishmentsTypes = allDefaultEstablishmentsTypes.concat(
              allCustomEstablishmentTypesList,
            );

            return allEstablishmentsTypes;
          }

          return allDefaultEstablishmentsTypes;
        }

        case "all": {
          const allDefaultEstablishmentsTypes =
            await this.prisma.establishmentType.findMany({
              where: {
                establishmentRegistered: null,
              },
            });

          if (decodedToken.establishmentBounded) {
            const allCustomEstablishmentsTypesFromEstablishment =
              await this.prisma.establishmentType.findMany({
                where: {
                  NOT: {
                    establishmentRegistered: null,
                  },
                },
              });

            const establishmentsTypeListPromises =
              allCustomEstablishmentsTypesFromEstablishment.map(
                async (establishmentType) => {
                  const establishmentRegistered =
                    await this.prisma.establishment.findUnique({
                      where: {
                        id:
                          establishmentType.establishmentRegistered ||
                          undefined,
                      },
                    });

                  return {
                    id: establishmentType.id,
                    name: establishmentType.name,
                    availableFor: establishmentType.availableFor,
                    status: establishmentType.status,
                    establishmentRegistered:
                      establishmentType.establishmentRegistered,
                    establishmentRegisteredName: establishmentRegistered?.name,
                    establishmentRegisteredAbbreviation:
                      establishmentRegistered?.abbreviation,
                  };
                },
              );

            const allCustomEstablishmentTypesList = await Promise.all(
              establishmentsTypeListPromises,
            );

            const allEstablishmentsTypes = allDefaultEstablishmentsTypes.concat(
              allCustomEstablishmentTypesList,
            );

            return allEstablishmentsTypes;
          }

          return allDefaultEstablishmentsTypes;
        }
        default: {
          const allDefaultEstablishmentsTypes =
            await this.prisma.establishmentType.findMany({
              where: {
                establishmentRegistered: null,
              },
            });

          if (decodedToken.establishmentBounded) {
            const allCustomEstablishmentsTypesFromEstablishment =
              await this.prisma.establishmentType.findMany({
                where: {
                  establishmentRegistered: decodedToken.establishmentBounded,
                },
              });

            const establishmentsTypeListPromises =
              allCustomEstablishmentsTypesFromEstablishment.map(
                async (establishmentType) => {
                  const establishmentRegistered =
                    await this.prisma.establishment.findUnique({
                      where: {
                        id:
                          establishmentType.establishmentRegistered ||
                          undefined,
                      },
                    });

                  return {
                    id: establishmentType.id,
                    name: establishmentType.name,
                    availableFor: establishmentType.availableFor,
                    status: establishmentType.status,
                    establishmentRegistered:
                      establishmentType.establishmentRegistered,
                    establishmentRegisteredName: establishmentRegistered?.name,
                    establishmentRegisteredAbbreviation:
                      establishmentRegistered?.abbreviation,
                  };
                },
              );

            const allCustomEstablishmentTypesList = await Promise.all(
              establishmentsTypeListPromises,
            );

            const allEstablishmentsTypes = allDefaultEstablishmentsTypes.concat(
              allCustomEstablishmentTypesList,
            );

            return allEstablishmentsTypes;
          }

          return allDefaultEstablishmentsTypes;
        }
      }
    }

    const establishmentTypeFoundById =
      await this.prisma.establishmentType.findUnique({
        where: {
          id,
        },
      });

    if (!establishmentTypeFoundById) {
      throw new NotFoundException("Establishment type not found");
    }

    return establishmentTypeFoundById;
  }
}
