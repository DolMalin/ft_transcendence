import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AvatarService } from './services/avatar.service';
import { Avatar
 } from './entities/avatar.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Avatar])],
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtService, AvatarService],
  exports: [UsersService]
})
export class UsersModule {}
