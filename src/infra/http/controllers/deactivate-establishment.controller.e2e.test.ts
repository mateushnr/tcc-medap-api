import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";

describe("Deactivate establishment (E2E)", () => {
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

  test("[PATCH] /api/establishments/deactivate", async () => {
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
        targetCustomer: "HUMAN",
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
      .patch("/api/establishments/deactivate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ idEstablishmentToDeactivate: baseEstablishment.id });

    expect(response.statusCode).toBe(200);

    const establishmentDeactivated = await prisma.establishment.findUnique({
      where: {
        id: baseEstablishment.id,
      },
    });

    expect(establishmentDeactivated?.status).toEqual("DEACTIVATED");
  });
});
