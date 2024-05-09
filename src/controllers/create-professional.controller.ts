import {
  Controller,
  Post,
  HttpCode,
  Body,
  ConflictException,
  UsePipes,
  UseGuards,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { Prisma } from '@prisma/client'

const createProfessionalBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string(),
  phone: z.string(),
  role: z.string(),
  birthDate: z.string(),
  status: z.string(),
  password: z.string(),
  accessLevel: z.coerce.number(),
  bound: z.string(),
  professionalEstablishment: z.string(),
  postCode: z.string().optional(),
  street: z.string().optional(),
  number: z.coerce.number().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  compliment: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
})

type CreateProfessionalBodySchema = z.infer<typeof createProfessionalBodySchema>

@Controller('/api')
@UseGuards(JwtAuthGuard)
export class CreateProfessionalController {
  constructor(private prisma: PrismaService) {}

  @Post('/professionals')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createProfessionalBodySchema))
  async handle(@Body() body: CreateProfessionalBodySchema) {
    const {
      name,
      email,
      cpf,
      phone,
      role,
      birthDate,
      status,
      password,
      accessLevel,
      bound,
      professionalEstablishment,
      ...addressData
    } = body

    const emailAlreadyRegistered = await this.prisma.professional.findUnique({
      where: {
        email,
      },
    })

    const cpfAlreadyRegistered = await this.prisma.professional.findUnique({
      where: {
        cpf,
      },
    })

    if (emailAlreadyRegistered) {
      throw new ConflictException(
        'Professional with same email already exists.',
      )
    }

    if (cpfAlreadyRegistered) {
      throw new ConflictException('Professional with same CPF already exists.')
    }

    const hashedPassword = await hash(password, 8)

    try {
      const professionalCreated = await this.prisma.professional.create({
        data: {
          name,
          email,
          cpf,
          phone,
          role,
          birthDate,
          status,
          password: hashedPassword,
          accessLevel,
          bound,
          professionalEstablishment,
        },
      })

      const isAddressEmpty = Object.keys(addressData).length === 0

      if (!isAddressEmpty) {
        const resideAddress = await this.prisma.address.create({
          data: {
            street: addressData.street,
            number: addressData.number,
            neighborhood: addressData.neighborhood,
            city: addressData.city,
            state: addressData.state,
            postCode: addressData.postCode,
            compliment: addressData.compliment,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          },
        })

        await this.prisma.professional.update({
          where: {
            id: professionalCreated.id,
          },
          data: {
            professionalAddress: resideAddress.id,
          },
        })
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(
          'Failed to create professional: ' + error.message,
        )
      } else {
        throw error
      }
    }
  }
}
