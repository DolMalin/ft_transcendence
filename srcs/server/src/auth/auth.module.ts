import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { AccessToken2FAStrategy } from './strategies/accessToken2FA.strategy';
import { RefreshToken2FAStrategy } from './strategies/refreshToken2FAStrategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, AccessToken2FAStrategy, RefreshToken2FAStrategy]
})
export class AuthModule {}
