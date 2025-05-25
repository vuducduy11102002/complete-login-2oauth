import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { RolesGuard } from '../auth/guards/roles.guard';


@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, RolesGuard],
    // providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}