import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
        const expiresIn = configService.get<string>('jwt.expiresIn') || '7d';
        return {
          secret: configService.get<string>('jwt.secret') || 'your-secret-key-change-in-production',
          signOptions: {
            expiresIn: expiresIn,
          },
        } as JwtModuleOptions;
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, GoogleStrategy],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
