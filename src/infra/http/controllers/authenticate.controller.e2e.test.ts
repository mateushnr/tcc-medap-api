import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";

describe("Authenticate user (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  test("[POST] /sessions", async () => {
    const establishmentType = await prisma.establishmentType.create({
      data: {
        name: "Hospital",
        availableFor: "BOTH",
        status: "ACTIVE",
      },
    });

    const establishment = await prisma.establishment.create({
      data: {
        name: "Establishment Test",
        abbreviation: "Estest",
        cnpj: "00.000.000/0000-00",
        establishmentType: establishmentType.id,
        especiality: "Cardiologia",
        mainPhone: "18 99999-9999",
        secondaryPhone: "18 99888-8888",
        email: "test@gmail.com",
        targetCustomer: "HUMAN",
        status: "ACTIVE",
      },
    });

    const professional = await prisma.professional.create({
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
        establishmentBounded: establishment.id,
      },
    });

    const response = await request(app.getHttpServer()).post("/sessions").send({
      organization: establishment.name,
      email: professional.email,
      password: "123456",
    });

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
  });
});
