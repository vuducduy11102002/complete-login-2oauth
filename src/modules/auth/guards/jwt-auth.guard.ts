import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Gọi parent canActivate trước
      const result = await super.canActivate(context);
      if (!result) {
        return false;
      }

      // Kiểm tra blacklist token
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s/, '');
        
        // Kiểm tra token có bị blacklist không
        const isBlacklisted = await this.authService.isTokenBlacklisted(token);
        
        if (isBlacklisted) {
          this.logger.warn(`Token blacklisted for user: ${request.user?.email || 'unknown'}`);
          throw new UnauthorizedException('Token has been revoked');
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`JWT Guard error: ${error.message}`);
      throw error;
    }
  }
}