import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/auth/Schema/user.schema';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private s3Service: S3Service,
  ) {}
  async nameUpdate(data) {
    const { email, newname } = data;
    const user = this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Not Found');
    }
    console.log('j');
    await this.userModel.updateOne(
      { email: email },
      { $set: { name: newname } },
    );
    return 'Name changed succesfully';
  }

  async updateProfileImage(
    email: string,
    newFilename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string }> {
    const user = await this.userModel.findOne({ email: email });
    if (!user) throw new BadRequestException('User not found');

    const oldKey = user.profile_image;

    if (oldKey) {
      await this.s3Service.deleteFile(oldKey);
    }

    const newKey = `images/${Date.now()}-${newFilename}`;

    user.profile_image = newKey;
    await user.save();

    const uploadUrl = await this.s3Service.generatePreSignedUrl(
      newKey,
      contentType,
    );

    return { uploadUrl };
  }
}
