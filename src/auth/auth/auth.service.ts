import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './DTO/signup.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './Schema/user.schema';
import { errorService } from 'src/error/error.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './DTO/login.dto';
import { JwtService } from '@nestjs/jwt';
import { forgetPassword } from './Schema/forget.password.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(forgetPassword.name) private passwordModel: Model<forgetPassword>,
    private errorService: errorService,

    private jwtService: JwtService,
  ) {}
  async signup(signupData: SignupDto) {
    const { email, name, phone, password } = signupData;
    const emailInUse = await this.UserModel.findOne({
      email: signupData.email,
    });
    if (emailInUse) {
      this.errorService.throwError('EXIST')
    }
    const phoneInUse = await this.UserModel.findOne({
      phone: signupData.phone,
    });
    if (phoneInUse) {
      throw new BadRequestException('Phone number already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    if (user) {
      return { Message: `${name} registered successfully` };
    }
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const matchedpassword = await bcrypt.compare(password, user.password);
    if (!matchedpassword) {
      throw new BadRequestException('Invalid credentials');
    }
    const userID = user._id;
    const accessToken = this.jwtService.sign({ userID });
    return {
      Message: `token generated successfully ${accessToken}`,
    };
  }

  async forgetPassword(email: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email does not exist');
    }
    const { canAttempt, attemptsRemaining } = await this.count(email);
    if (canAttempt) {
      const useremail = user.email;
      const accessToken = this.jwtService.sign({ useremail });
      return {
        accessToken,
        message: `Password reset email sent.  You have ${attemptsRemaining - 1} attempts remaining today.`,
      };
    }
    return {
      message: 'You have exhausted your daily limit of 5 password reset requests.',
    };
  }


  async changepassword(email: string, npassword: string) {
    const hpassword = await bcrypt.hash(npassword, 10);
    await this.UserModel.updateOne(
      { email: email },
      { $set: { password: hpassword } },
    );
  }

  async savekey(key: string, userID: string) {
    await this.UserModel.updateOne(
      { _id: userID },
      { $set: { profile_image: key } },
    );
  }
  async findkey(email: string) {
    const user = await this.UserModel.findOne({ email: email });
    if (!user) throw new BadRequestException('user does not exist');
    console.log(user.profile_image);
    return user.profile_image;
  }


  async count(email: string): Promise<{ canAttempt: boolean; attemptsRemaining: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await this.passwordModel.findOne({
      email,
      resetRequestDate: { $gte: today }, 
    });

    if (!user) {
      await this.passwordModel.create({
        email: email,
        count: 1,
        resetRequestDate: today,
      });
      return { canAttempt: true, attemptsRemaining: 5 }; 
    }
    const attempts = user.count;
    if (attempts < 5) {
      return { canAttempt: true, attemptsRemaining: 5 - attempts };
    }
    return { canAttempt: false, attemptsRemaining: 0 };
  }

  async attempt(email: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await this.passwordModel.findOne({
      email,
      resetRequestDate: { $gte: today }, 
    });

    if (user) {
      await this.passwordModel.updateOne(
        { email: email, resetRequestDate: { $gte: today } }, 
        { $inc: { count: 1 } }, 
      );
    } else {
      await this.passwordModel.create({
        email: email,
        count: 1,
        resetRequestDate: today,
      });
    }
  }
}
