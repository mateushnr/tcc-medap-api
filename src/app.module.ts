import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'
import { CreateProfessionalController } from './controllers/create-professional.controller'
import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'
import { AuthenticateController } from './controllers/authenticate-controller'
import { CreateEstablishmentController } from './controllers/create-establishment.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateProfessionalController,
    AuthenticateController,
    CreateEstablishmentController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
