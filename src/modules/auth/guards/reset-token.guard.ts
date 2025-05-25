import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResetTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s/, '');
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'reset-password')
        throw new UnauthorizedException('Invalid reset token');
      req.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
