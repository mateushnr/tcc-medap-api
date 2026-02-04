import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";

describe("Create establishment (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST] /api/establishments", async () => {
    const establishmentType = await prisma.establishmentType.create({
      data: {
        name: "Hospital",
        availableFor: "BOTH",
        status: "ACTIVE",
      },
    });

    const baseEstablishment = await prisma.establishment.create({
      data: {
        name: "Establishment Test",
        abbreviation: "Estest",
        cnpj: "00.000.000/0000-00",
        establishmentType: establishmentType.id,
        especiality: "Cardiologia",
        mainPhone: "18 99999-9999",
        secondaryPhone: "18 99888-8888",
        email: "test@gmail.com",
        status: "ACTIVE",
        targetCustomer: "HUMAN",
      },
    });

    const baseProfessional = await prisma.professional.create({
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

    const accessToken = jwt.sign({ sub: baseProfessional.id });

    const response = await request(app.getHttpServer())
      .post("/api/establishments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Sistema de acompanhamento de medicação e prescrição",
        abbreviation: "Medap",
        cnpj: "57.819.029/0001-17",
        establishmentType: establishmentType.id,
        especiality: "Cardiologia",
        mainPhone: "18 99888-8888",
        secondaryPhone: "18 99777-7777",
        email: "medap@contato.com",
        status: "ACTIVE",
        targetCustomer: "HUMAN",
        street: "Rua General Oliveira Ramos",
        number: 751,
        neighborhood: "Jardim Itapura",
        city: "São Paulo",
        state: "São Paulo",
        postCode: "04469-125",
        latitude: 222.1447,
        longitude: -46.989,
      });

    expect(response.statusCode).toBe(201);

    const establishmentOnDatabase = await prisma.establishment.findUnique({
      where: {
        name: "Sistema de acompanhamento de medicação e prescrição",
        cnpj: "57.819.029/0001-17",
        abbreviation: "Medap",
        email: "medap@contato.com",
      },
    });

    expect(establishmentOnDatabase).toBeTruthy();
  });
});
