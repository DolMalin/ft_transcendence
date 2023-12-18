import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IsInt, IsOptional, IsUUID, Max, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

class userIdDto {
    @IsUUID()
    userId: string
}

class roomIdDto {
  @IsInt()
  @Max(1000000)
  roomId: number
}

export const UUIDParam = createParamDecorator(
  async (id: string, ctx: ExecutionContext) => {
    const [request] = ctx.getArgs();
    const { params } = request;

    const userId = params.id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const errors = await validate(plainToClass(userIdDto, { userId }));
    if (errors.length > 0) {
      throw new BadRequestException('Invalid UUID');
    }

    return userId;
  },
);

export const INTParam = createParamDecorator(
  async (id: number, ctx: ExecutionContext) => {
    const [request] = ctx.getArgs();
    const { params } = request;

    console.log(params)
    const roomId = Number(params.id);
    console.log(typeof roomId)

    if (!roomId) {
      throw new BadRequestException('User ID is required');
    }

    const errors = await validate(plainToClass(roomIdDto, { roomId }));
    if (errors.length > 0) {
      throw new BadRequestException('Invalid UUID');
    }

    return roomId;
  },
);