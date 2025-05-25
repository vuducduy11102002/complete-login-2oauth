import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { generateOTP } from '../../../shared/utils';
import { MailsService } from 'src/modules/users/mails/services/mails.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailsService: MailsService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Wrong credentials');

    const code = generateOTP();
    await this.usersService.setVerificationCode(email, code);
    await this.mailsService.sendMail(email, 'Your login verification code', `Your code: ${code}`);

    return { message: 'Verification code sent to your email' };
  }

  async verifyOtp(email: string, code: string) {
    const ok = await this.usersService.verifyAccount(email, code);
    if (!ok) throw new UnauthorizedException('Invalid code');

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

        const payload = { email: user.email, userId: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
    
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Có thể chọn trả về thông báo chung nếu muốn bảo mật
      // return { message: 'If this email exists, a reset code has been sent.' };
      throw new UnauthorizedException('Email does not exist in our system.');
    }
    const code = generateOTP();
    await this.usersService.setResetCode(email, code);
    await this.mailsService.sendMail(
      email,
      'Your password reset code',
      `Your reset code: ${code}`,
    );
    return { message: 'Reset code sent to your email' };
  }

  async verifyResetOtp(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.resetCode !== code)
      throw new UnauthorizedException('Invalid reset code');
    // Đúng, trả về reset_token (JWT có type đặc biệt)
    const resetToken = this.jwtService.sign(
      { email, type: 'reset-password' , role: user.role},
      { expiresIn: '10m' }
    );
    return { reset_token: resetToken };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const ok = await this.usersService.resetPassword(email, code, newPassword);
    if (!ok) throw new UnauthorizedException('Invalid code');
    return { message: 'Password reset successful' };
  }

  async resetPasswordWithToken(
    newPassword: string,
    confirmPassword: string,
    req: any,
  ) {
    if (newPassword !== confirmPassword)
      throw new UnauthorizedException('Passwords do not match');
    const { email, type } = req.user;
    if (type !== 'reset-password')
      throw new UnauthorizedException('Invalid reset token');
    await this.usersService.updatePasswordByEmail(email, newPassword);
    return { message: 'Password reset successful' };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const user = await this.usersService.findById(userId); // cần thêm hàm này trong usersService
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersService.updateUser(user);

    return { message: 'Password changed successfully' };
  }


}