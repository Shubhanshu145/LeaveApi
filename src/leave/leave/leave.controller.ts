import { Controller, Post, Body, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { UserGuard } from './guards/user.guard';


@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

    @Post()
    @UseGuards(UserGuard)
    async applyLeave(@Body() body: { leaveType: string; from: string; to: string }, @Req() req,) {
    const userId = req.user.id;
    return this.leaveService.applyLeave(
      userId,
      body.leaveType,
      new Date(body.from),
      new Date(body.to),
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
  @Get(':leaveId')
  async getLeave(@Param('leaveId') leaveId: string, @Req() req) {
    return this.leaveService.getLeaveById(req.user._id, leaveId);
  }
}
