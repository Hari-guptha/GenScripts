import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(registerDto: RegisterDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async createOrUpdateGoogleUser(profile: any): Promise<UserDocument> {
    const existingUser = await this.findByGoogleId(profile.googleId);
    if (existingUser) {
      existingUser.avatar = profile.avatar;
      existingUser.name = profile.name;
      return existingUser.save();
    }

    const existingEmailUser = await this.findByEmail(profile.email);
    if (existingEmailUser) {
      existingEmailUser.googleId = profile.googleId;
      existingEmailUser.avatar = profile.avatar;
      return existingEmailUser.save();
    }

    const user = new this.userModel({
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      googleId: profile.googleId,
    });
    return user.save();
  }

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    if (!user.password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  async setResetPasswordToken(email: string, token: string, expires: Date): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }

  async initializeDefaultUser(): Promise<void> {
    const defaultEmail = 'hari@gmail.com';
    const defaultPassword = '123456';

    const existingUser = await this.findByEmail(defaultEmail);
    if (existingUser) {
      console.log('Default user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const defaultUser = new this.userModel({
      email: defaultEmail,
      password: hashedPassword,
      name: 'Hari',
      isActive: true,
    });

    await defaultUser.save();
    console.log('Default user created: hari@gmail.com');
  }
}
