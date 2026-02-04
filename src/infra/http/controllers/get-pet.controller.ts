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
export class GetPetController {
  constructor(private prisma: PrismaService) {}

  @Get("/pets")
  @HttpCode(200)
  async handle(
    @Query("id") id?: string,
    @Query("ownerId") ownerId?: string,
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

      if (fromEstablishment) {
        whereOptions.establishmentRegistered = fromEstablishment;
      }

      if (ownerId) {
        whereOptions.customerOwner = ownerId;
      }

      if (search) {
        whereOptions.OR = [
          { petName: { contains: search, mode: "insensitive" } },
          { specie: { contains: search, mode: "insensitive" } },
          { breed: { contains: search, mode: "insensitive" } },
          { age: { contains: search, mode: "insensitive" } },
          {
            owner: { name: { contains: search, mode: "insensitive" } },
          },
          {
            owner: { cpf: { contains: search, mode: "insensitive" } },
          },
          {
            owner: { otherDocument: { contains: search, mode: "insensitive" } },
          },
        ];
      }

      searchOptions = {
        where: whereOptions,
      };

      if (page) {
        searchOptions.skip = skip;
        searchOptions.take = pageSize;
      }

      const [allPets, totalCount] = await this.prisma.$transaction([
        this.prisma.pet.findMany(searchOptions),
        this.prisma.pet.count({ where: whereOptions }),
      ]);

      if (!allPets) {
        throw new NotFoundException("No pet found");
      }

      if (allPets) {
        const petsListPromises = allPets.map(async (pet) => {
          const customerOwnerBounded = await this.prisma.customer.findUnique({
            where: { id: pet.customerOwner },
          });

          return {
            id: pet.id,
            petName: pet.petName,
            specie: pet.specie,
            breed: pet.breed,
            age: pet.age,
            size: pet.size,
            sex: pet.sex,
            status: pet.status,

            establishmentRegistered: pet.establishmentRegistered,
            customerOwner: pet.customerOwner,
            cpfOwner: customerOwnerBounded?.cpf,
            documentOwner: customerOwnerBounded?.otherDocument,
            nameOwner: customerOwnerBounded?.name,
          };
        });
        const petsList = await Promise.all(petsListPromises);

        if (page) {
          return { data: petsList, totalCount };
        }

        return petsList;
      }
    }

    if (id) {
      const petFoundById = await this.prisma.pet.findUnique({
        where: {
          id,
        },
      });

      if (!petFoundById) {
        throw new NotFoundException("Pet not found");
      }

      return petFoundById;
    }
  }
}
