import { IsString } from 'class-validator';

export class uploadUrlDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsString()
  userID: string;
}
