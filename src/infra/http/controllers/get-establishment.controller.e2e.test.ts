import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { Address, Establishment, Professional } from "@prisma/client";
import { hash } from "bcryptjs";
import request from "supertest";

describe("Get establishment (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  let baseEstablishmentAddress: Address;
  let baseEstablishment: Establishment;
  let baseProfessional: Professional;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    const establishmentType = await prisma.establishmentType.create({
      data: {
        name: "Hospital",
        availableFor: "BOTH",
        status: "ACTIVE",
      },
    });

    baseEstablishmentAddress = await prisma.address.create({
      data: {
        street: "Rua General Oliveira Ramos",
        postCode: "04469-125",
        number: 751,
        neighborhood: "Jardim Itapura",
        city: "São Paulo",
        state: "São Paulo",
        latitude: 22.1447,
        longitude: -46.989,
      },
    });

    baseEstablishment = await prisma.establishment.create({
      data: {
        name: "Establishment Test",
        abbreviation: "Estest",
        cnpj: "00.000.000/0000-00",
        establishmentType: establishmentType.id,
        especiality: "Cardiologia",
        mainPhone: "18 99999-9999",
        targetCustomer: "HUMAN",
        secondaryPhone: "18 99888-8888",
        email: "test@gmail.com",
        status: "ACTIVE",
        establishmentAddress: baseEstablishmentAddress.id,
      },
    });

    baseProfessional = await prisma.professional.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
        cpf: "000.000.000-00",
        phone: "18 99999-9999",
        role: "HEALTH_PROFESSIONAL",
        birthDate: "01/01/2000",
        status: "ACTIVE",
        password: await hash("123456", 8),
        boundedTo: "ESTABLISHMENT",
        establishmentBounded: baseEstablishment.id,
      },
    });

    await app.init();
  });

  test("[GET] /api/establishments", async () => {
    const otherEstablishmentType = await prisma.establishmentType.create({
      data: {
        name: "Clinic",
        availableFor: "BOTH",
        status: "ACTIVE",
      },
    });
    const otherEstablishment = await prisma.establishment.create({
      data: {
        name: "Establishment Test2",
        abbreviation: "Estest2",
        cnpj: "00.000.000/0000-01",
        establishmentType: otherEstablishmentType.id,
        especiality: "Cardiologia",
        mainPhone: "18 99999-9998",
        targetCustomer: "HUMAN",
        secondaryPhone: "18 99888-8888",
        email: "test2@gmail.com",
        status: "ACTIVE",
      },
    });

    const accessToken = jwt.sign({ sub: baseProfessional.id });

    const responseGetAllEstablishment = await request(app.getHttpServer())
      .get("/api/establishments")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(responseGetAllEstablishment.statusCode).toBe(200);

    const establishmentsList = responseGetAllEstablishment.body;

    expect(establishmentsList).toEqual([baseEstablishment, otherEstablishment]);
  });

  test("[GET] /api/establishments/?id=", async () => {
    const accessToken = jwt.sign({ sub: baseProfessional.id });

    const responseGetEstablishmentById = await request(app.getHttpServer())
      .get(`/api/establishments/?id=${baseEstablishment.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(responseGetEstablishmentById.statusCode).toBe(200);

    const establishmentFoundById = responseGetEstablishmentById.body;

    expect(establishmentFoundById).toEqual({
      ...baseEstablishment,
      ...baseEstablishmentAddress,
    });
  });
});
