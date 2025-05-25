import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { MailsModule } from '../users/mails/mails.module';
import { JwtStrategy } from './guards/jwt.strategy';

require('dotenv').config();
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN},
    }),
    UsersModule,
    MailsModule,
    
  ],
  // providers: [AuthService,JwtStrategy,RolesGuard],
  providers: [AuthService,JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}