import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const createEstablishmentBodySchema = z.object({
  name: z.string(),
  abbreviation: z.string(),
  cnpj: z.string(),
  type: z.string(),
  especiality: z.string(),
  mainPhone: z.string(),
  secondaryPhone: z.string().optional(),
  email: z.string().email(),
  status: z.string(),
  postCode: z.string(),
  street: z.string(),
  number: z.coerce.number(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  compliment: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
})

type CreateEstablishmentBodySchema = z.infer<
  typeof createEstablishmentBodySchema
>

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class CreateEstablishmentController {
  constructor(private prisma: PrismaService) {}

  @Post('/establishments')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createEstablishmentBodySchema))
  async handle(@Body() body: CreateEstablishmentBodySchema) {
    const {
      name,
      abbreviation,
      cnpj,
      type,
      especiality,
      mainPhone,
      secondaryPhone,
      email,
      status,
      postCode,
      street,
      number,
      neighborhood,
      city,
      state,
      compliment,
      latitude,
      longitude,
    } = body

    const nameAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        name,
      },
    })

    const abbreviationAlreadyRegistered =
      await this.prisma.establishment.findUnique({
        where: {
          abbreviation,
        },
      })

    const cnpjAlreadyRegistered = await this.prisma.establishment.findUnique({
      where: {
        cnpj,
      },
    })

    if (nameAlreadyRegistered) {
      throw new ConflictException(
        'Establishment with same name already exists.',
      )
    }

    if (abbreviationAlreadyRegistered) {
      throw new ConflictException(
        'Establishment with same abbreviation already exists',
      )
    }

    if (cnpjAlreadyRegistered) {
      throw new ConflictException('Establishment with same cnpj already exists')
    }

    try {
      const establishmentCreated = await this.prisma.establishment.create({
        data: {
          name,
          abbreviation,
          cnpj,
          type,
          especiality,
          mainPhone,
          secondaryPhone,
          email,
          status,
        },
      })

      const localeEstablishment = await this.prisma.address.create({
        data: {
          street,
          number,
          neighborhood,
          city,
          state,
          postCode,
          compliment,
          latitude,
          longitude,
        },
      })

      await this.prisma.establishment.update({
        where: {
          id: establishmentCreated.id,
        },
        data: {
          establishmentAddress: localeEstablishment.id,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          'Failed to create establishment: ' + error.message,
        )
      } else {
        throw error
      }
    }
  }
}
