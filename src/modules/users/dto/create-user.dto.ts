import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user1@example.com',
    description: 'Email đăng ký tài khoản, phải hợp lệ và duy nhất',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Mật khẩu tối thiểu 6 ký tự, nên có chữ hoa, chữ thường, số',
    minLength: 6,
  })

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}