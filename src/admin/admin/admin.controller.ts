// // src/admin/admin.controller.ts
// import { Controller, Get, Patch, Param, UseGuards, Query } from '@nestjs/common';
// import { AdminService } from './admin.service';

// import { LeaveStatus } from '../leave/schemas/leave.schema';
// import { JwtAuthGuard } from 'src/auth/auth/guards/jwt-auth.guard';
// import { Roles } from 'src/auth/auth/decorators/roles.decorator';
// import { RolesGuard } from 'src/auth/auth/guards/roles.guards';
// import { Role } from 'src/auth/auth/enums/role.enum';

// @Controller('admin/leaves')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class AdminController {
//   constructor(private readonly adminService: AdminService) {}

//   @Get()
//   @Roles(Role.ADMIN)
//   async getAllLeaves(
//     @Query('status') status?: LeaveStatus,
//     @Query('page') page = 1,
//     @Query('limit') limit = 10,
//   ) {
//     return this.adminService.getAllLeaves(status, page, limit);
//   }

//   @Patch(':id/approve')
//   @Roles(Role.ADMIN)
//   async approveLeave(@Param('id') id: string) {
//     return this.adminService.updateLeaveStatus(id, LeaveStatus.APPROVED);
//   }

//   @Patch(':id/reject')
//   @Roles(Role.ADMIN)
//   async rejectLeave(@Param('id') id: string) {
//     return this.adminService.updateLeaveStatus(id, LeaveStatus.REJECTED);
//   }
// }