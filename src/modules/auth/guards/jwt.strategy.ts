import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Kiểm tra payload có đầy đủ thông tin không
    if (!payload.userId || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Kiểm tra token có bị blacklist không
    // Lưu ý: Blacklist check sẽ được thực hiện trong AuthService
    // vì strategy không có access trực tiếp đến request object
    
    // req.user = payload
    return { userId: payload.userId, email: payload.email, role: payload.role };
  }
}
