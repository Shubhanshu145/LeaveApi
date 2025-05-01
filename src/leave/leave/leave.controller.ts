import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { UserGuard } from './guards/user.guard';
import { leaveDto } from './DTO/leave.dto';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @UseGuards(UserGuard)
  async applyLeave(@Body() body: leaveDto, @Req() req) {
    const { leaveType, from, to } = body;
    const userId = req.user.id;
    return this.leaveService.applyLeave(
      userId,
      leaveType,
      new Date(from),
      new Date(to),
    );
  }

  @UseGuards(UserGuard)
  @Get()
  async getLeaves(
    @Query('type') type: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Req() req,
  ) {
    return this.leaveService.getLeaves(req.user.id, type, +page, +limit);
  }
  @UseGuards(UserGuard)
  @Get(':leaveId')
  async getLeave(@Param('leaveId') leaveId: string, @Req() req) {
    return this.leaveService.getLeaveById(req.user._id, leaveId);
  }
}
