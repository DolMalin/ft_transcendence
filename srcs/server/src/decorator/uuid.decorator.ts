import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IsUUID, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

class dto {
    @IsUUID()
    userId: string
}

export const UUIDParam = createParamDecorator(
  async (id: string, ctx: ExecutionContext) => {
    const [request] = ctx.getArgs();
    const { params } = request;

    console.log(params)
    const userId = params.id;

    console.log(userId)
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const errors = await validate(plainToClass(dto, { userId }));
    if (errors.length > 0) {
      throw new BadRequestException('Invalid UUID');
    }

    return userId;
  },
);