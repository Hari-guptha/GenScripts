import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from './schemas/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const payload = { email: user.email, sub: user._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  async googleLogin(user: any) {
    const dbUser = await this.usersService.createOrUpdateGoogleUser(user);
    const payload = { email: dbUser.email, sub: dbUser._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.setResetPasswordToken(email, token, expires);
    // In production, send email with reset link
    return { message: 'If the email exists, a reset link has been sent', token }; // Remove token in production
  }

  async resetPassword(token: string, newPassword: string) {
    await this.usersService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }
}
