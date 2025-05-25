import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'testuser@example.com',
    description: 'Tài khoản email dùng để đăng nhập',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'YourStrongPass123',
    description: 'Mật khẩu tài khoản',
  })
  @IsNotEmpty()
  password: string;
}