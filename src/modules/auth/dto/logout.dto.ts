import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    example: 'Logged out successfully',
    description: 'Thông báo đăng xuất thành công',
  })
  message: string;
} 