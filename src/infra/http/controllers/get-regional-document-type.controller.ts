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
export class GetRegionalDocumentTypeController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Get("/professionals/documents")
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
          const allDefaultRegionalDocumentTypes =
            await this.prisma.regionalDocumentType.findMany({
              where: {
                establishmentRegistered: null,
              },
            });

          if (decodedToken.establishmentBounded) {
            const allCustomRegionalDocumentTypesFromEstablishment =
              await this.prisma.regionalDocumentType.findMany({
                where: {
                  establishmentRegistered: decodedToken.establishmentBounded,
                },
              });

            const regionalDocumentsTypeListPromises =
              allCustomRegionalDocumentTypesFromEstablishment.map(
                async (documentType) => {
                  const establishmentRegistered =
                    await this.prisma.establishment.findUnique({
                      where: {
                        id: documentType.establishmentRegistered || undefined,
                      },
                    });

                  return {
                    id: documentType.id,
                    name: documentType.name,
                    abbreviation: documentType.abbreviation,
                    status: documentType.status,
                    establishmentRegistered:
                      documentType.establishmentRegistered,
                    establishmentRegisteredName: establishmentRegistered?.name,
                    establishmentRegisteredAbbreviation:
                      establishmentRegistered?.abbreviation,
                  };
                },
              );

            const allCustomRegionalDocumentTypesList = await Promise.all(
              regionalDocumentsTypeListPromises,
            );

            const allRegionalDocumentTypes =
              allDefaultRegionalDocumentTypes.concat(
                allCustomRegionalDocumentTypesList,
              );

            return allRegionalDocumentTypes;
          }

          return allDefaultRegionalDocumentTypes;
        }
        default: {
          const allDefaultRegionalDocumentTypes =
            await this.prisma.regionalDocumentType.findMany({
              where: {
                establishmentRegistered: null,
              },
            });

          if (decodedToken.establishmentBounded) {
            const allCustomRegionalDocumentTypesFromEstablishment =
              await this.prisma.regionalDocumentType.findMany({
                where: {
                  NOT: {
                    establishmentRegistered: null,
                  },
                },
              });

            const regionalDocumentsTypeListPromises =
              allCustomRegionalDocumentTypesFromEstablishment.map(
                async (documentType) => {
                  const establishmentRegistered =
                    await this.prisma.establishment.findUnique({
                      where: {
                        id: documentType.establishmentRegistered || undefined,
                      },
                    });

                  return {
                    id: documentType.id,
                    name: documentType.name,
                    abbreviation: documentType.abbreviation,
                    status: documentType.status,
                    establishmentRegistered:
                      documentType.establishmentRegistered,
                    establishmentRegisteredName: establishmentRegistered?.name,
                    establishmentRegisteredAbbreviation:
                      establishmentRegistered?.abbreviation,
                  };
                },
              );

            const allCustomRegionalDocumentTypesList = await Promise.all(
              regionalDocumentsTypeListPromises,
            );

            const allRegionalDocumentTypes =
              allDefaultRegionalDocumentTypes.concat(
                allCustomRegionalDocumentTypesList,
              );

            return allRegionalDocumentTypes;
          }

          return allDefaultRegionalDocumentTypes;
        }
      }
    }

    const regionalDocumentTypeFoundById =
      await this.prisma.regionalDocumentType.findUnique({
        where: {
          id,
        },
      });

    if (!regionalDocumentTypeFoundById) {
      throw new NotFoundException("Regional document type not found");
    }

    return regionalDocumentTypeFoundById;
  }
}
