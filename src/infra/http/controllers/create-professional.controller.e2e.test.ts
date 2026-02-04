import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";

describe("Create professional (E2E)", () => {
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

  test("[POST] /api/professionals", async () => {
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
      .post("/api/professionals")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "John Doe Test",
        email: "johndoetest@example.com",
        cpf: "123.456.789-11",
        phone: "18 99888-8888",
        role: "ADMINISTRATOR",
        birthDate: "2000-01-01",
        status: "ACTIVE",
        password: "123456",
        accessLevel: "ADMINISTRATOR",
        bound: "Estabelecimento",
        professionalEstablishment: baseEstablishment.id,
        postCode: "04469-125",
        street: "Rua General Oliveira Ramos",
        number: 752,
        neighborhood: "Jardim Itapura",
        city: "São Paulo",
        state: "São Paulo",
      });

    expect(response.statusCode).toBe(201);

    const professionalOnDatabase = await prisma.professional.findFirst({
      where: {
        cpf: "123.456.789-11",
        email: "johndoetest@example.com",
      },
    });

    expect(professionalOnDatabase).toBeTruthy();
  });
});
