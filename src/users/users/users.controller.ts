import { Controller, Get, UseGuards ,Request, Patch, Body} from '@nestjs/common';
import { UserGuard } from 'src/leave/leave/guards/user.guard';
import { nameUpdateDto } from './DTO/name.update.dto';
import { UsersService } from './users.service';
// import { UsersGuard } from './guards/users.guard';

@Controller('users')
export class UsersController {
    constructor(private userService:UsersService){}
    @Get('profile')
    @UseGuards(UserGuard)
    getProfile(@Request() req) {
        const user = req['user'] ; 
        return user;
    }

    @Patch('name-update')
    @UseGuards(UserGuard)
    async nameUpdate(@Body() data:nameUpdateDto){
        return this.userService.nameUpdate(data);
    }


    @Patch('update-profile-image')
    // @UseGuards(UserGuard)
    async updateProfileImage(@Body() body: { email: string; filename: string; contentType: string }) {
    return this.userService.updateProfileImage(body.email, body.filename, body.contentType);
}   

    


}
