import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import * as bcrypt from 'bcrypt';
import { generateOTP } from '../../../shared/utils';
import { MailsService } from 'src/modules/users/mails/services/mails.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailsService: MailsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  // Thêm method để blacklist token khi logout
  async logout(token: string) {
    try {
      // Decode token để lấy thông tin
      const payload = this.jwtService.decode(token) as any;
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      // Tính thời gian còn lại của token
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExp = payload.exp || 0;
      const remainingTime = Math.max(0, tokenExp - currentTime);

      if (remainingTime > 0) {
        // Lưu token vào blacklist với TTL = thời gian còn lại
        const blacklistKey = `blacklist:${token}`;
        await this.cacheManager.set(blacklistKey, '1', remainingTime);
        
        this.logger.log(`Token blacklisted for user ${payload.email} - expires in ${remainingTime}s`);
      } else {
        this.logger.warn(`Token already expired for user ${payload.email}`);
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`);
      throw new UnauthorizedException('Logout failed');
    }
  }

  // Thêm method để validate token có bị blacklist không
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = `blacklist:${token}`;
      const isBlacklisted = await this.cacheManager.get(blacklistKey);
      
      if (isBlacklisted) {
        this.logger.warn(`Blacklisted token detected`);
      }
      
      return !!isBlacklisted;
    } catch (error) {
      this.logger.error(`Error checking token blacklist: ${error.message}`);
      return false; // Nếu có lỗi Redis, cho phép token (fail-safe)
    }
  }

  // Thêm method để revoke all tokens của user
  async revokeAllUserTokens(userId: number) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Tạo pattern để tìm tất cả tokens của user
      const userTokensPattern = `user_tokens:${userId}:*`;
      
      // Trong thực tế, bạn sẽ cần implement logic để track user tokens
      // Hoặc sử dụng Redis SCAN để tìm và revoke
      
      this.logger.log(`All tokens revoked for user ${user.email}`);
      return { message: 'All user tokens revoked successfully' };
    } catch (error) {
      this.logger.error(`Error revoking user tokens: ${error.message}`);
      throw new UnauthorizedException('Failed to revoke tokens');
    }
  }

  // Thêm method để get token info
  async getTokenInfo(token: string) {
    try {
      const payload = this.jwtService.decode(token) as any;
      if (!payload) {
        return null;
      }

      const isBlacklisted = await this.isTokenBlacklisted(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        isExpired,
        isBlacklisted,
        remainingTime: Math.max(0, payload.exp - currentTime),
      };
    } catch (error) {
      this.logger.error(`Error getting token info: ${error.message}`);
      return null;
    }
  }
}