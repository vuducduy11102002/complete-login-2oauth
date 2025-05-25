import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async createUser(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hash });
    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async setVerificationCode(email: string, code: string) {
    await this.userRepo.update({ email }, { verificationCode: code });
  }

  async verifyAccount(email: string, code: string) {
    const user = await this.findByEmail(email);
    if (user && user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = null;
      await this.userRepo.save(user);
      return true;
    }
    return false;
  }

  async findAll() {
  return this.userRepo.find();
}

  async setResetCode(email: string, code: string) {
    await this.userRepo.update({ email }, { resetCode: code });
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.findByEmail(email);
    if (user && user.resetCode === code) {
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetCode = null;
      await this.userRepo.save(user);
      return true;
    }
    return false;
  }

  async updatePassword(userId: number, oldPass: string, newPass: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user && await bcrypt.compare(oldPass, user.password)) {
      user.password = await bcrypt.hash(newPass, 10);
      await this.userRepo.save(user);
      return true;
    }
    return false;
  }

  async updatePasswordByEmail(email: string, newPassword: string) {
  const user = await this.findByEmail(email);
  if (!user) throw new UnauthorizedException('User not found');
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = null; // Xóa mã OTP sau khi đặt lại pass
  await this.userRepo.save(user);
}

async findById(userId: number) {
  return this.userRepo.findOne({ where: { id: userId } });
}

async updateUser(user: User) {
  return this.userRepo.save(user);
}
}