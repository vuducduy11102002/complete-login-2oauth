import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ResetTokenGuard } from '../guards/reset-token.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập (bước 1), gửi mã xác thực về email' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Nếu đúng email và mật khẩu, trả về message báo đã gửi mã xác thực về email.',
    schema: {
      example: { message: 'Verification code sent to your email' }
    }
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('verify-reset-otp')
  async verifyResetOtp(@Body() body: { email: string; code: string }) {
    return this.authService.verifyResetOtp(body.email, body.code);
  }

  
  // đổi mật khi quênquên

  @Post('reset-password')
  @UseGuards(ResetTokenGuard)
  async resetPassword(
    @Body() body: { newPassword: string; confirmPassword: string },
    @Req() req,
  ) {
    return this.authService.resetPasswordWithToken(
      body.newPassword,
      body.confirmPassword,
      req,
    );
  }


  // đổi mật khẩu sau khi đăng nhập thành công
    @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string; confirmPassword: string },
    @Req() req,
  ) {
    return this.authService.changePassword(
      req.user.userId, // hoặc req.user.id, tuỳ payload JWT bạn set
      body.currentPassword,
      body.newPassword,
      body.confirmPassword,
    );
  }
}