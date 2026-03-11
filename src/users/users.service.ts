import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type { Repository } from 'typeorm';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findOneByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { phoneNumber },
      select: ['id', 'phoneNumber', 'password', 'nickname', 'avatar', 'currentHashedRefreshToken'],
    });
  }

  findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  removeRefreshToken(userId: string) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findOneById(userId);

    // 如果该用户已登出或 refresh token 为空，则返回 null
    if (!user || !user.currentHashedRefreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
    return null; // Token 不匹配
  }
}
