import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const authenticateBodySchema = z.object({
  organization: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { organization, email, password } = body

    const establishment = await this.prisma.establishment.findFirst({
      where: {
        OR: [
          {
            name: organization,
          },
          {
            abbreviation: organization,
          },
        ],
      },
    })

    const professional = await this.prisma.professional.findUnique({
      where: {
        email,
      },
    })

    if (!establishment) {
      throw new UnauthorizedException(
        'Establishment does not exists on system.',
      )
    }

    if (!professional) {
      throw new UnauthorizedException('Professional credentials do not match.')
    }

    const isPasswordValid = await compare(password, professional.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Professional credentials do not match.')
    }

    const professionalBelongsToEstablishment =
      await this.prisma.professional.findUnique({
        where: {
          email: professional.email,
          professionalEstablishment: establishment.id,
        },
      })

    if (!professionalBelongsToEstablishment) {
      throw new UnauthorizedException(
        'Professional do not belong to this establishment.',
      )
    }

    const accessToken = this.jwt.sign({ sub: professional.id })

    return {
      access_token: accessToken,
    }
  }
}
