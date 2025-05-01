// import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';

// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';

// import { ConfigService } from '@nestjs/config';
// import { User } from 'src/auth/auth/Schema/user.schema';

// @Injectable()
// export class UsersGuard implements CanActivate {
//   constructor(private jwtService: JwtService, @InjectModel(User.name) private userModel: Model<User>,private configService:ConfigService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);
//     console.log("guard")
//     if (!token) {
//       throw new UnauthorizedException('Invalid Token');
//     }
//     try {
//       const payload = await this.jwtService.verify(token, {
//         secret: this.configService.get<string>('jwt.secret'),
//       });
//       const userId = payload.userID;
//       const user = await this.userModel.findById(userId).select('-password').exec();
//       if (!user) {
//         throw new UnauthorizedException('User not found');
//       }

//       request['user'] = user;
//       return true;
//     } catch (e) {
//       Logger.error(e.message);
//       throw new UnauthorizedException('Invalid Token');
//     }
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }
