import { Controller, Post, Body, UseGuards, Request, Get, Req } from '@nestjs/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UsersService } from '../services/users.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản mới', description: 'Tạo mới tài khoản với email và password. Email phải chưa từng đăng ký.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công, trả về thông tin user (ẩn mật khẩu) hoặc thông báo đã gửi mã xác thực về email.',
    schema: {
      example: {
        id: 1,
        email: 'user1@example.com',
        isVerified: false,
        createdAt: '2024-05-24T12:30:00.000Z',
        updatedAt: '2024-05-24T12:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Email đã tồn tại hoặc thông tin nhập không hợp lệ',
    schema: {
      example: {
        statusCode: 400,
        message: 'Email already exists',
        error: 'Bad Request'
      }
    }
  })
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }
    const success = await this.usersService.updatePassword(req.user.userId, dto.oldPassword, dto.newPassword);
    return { success };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getProfile(@Req() req) {
    return req.user; 
  }
}