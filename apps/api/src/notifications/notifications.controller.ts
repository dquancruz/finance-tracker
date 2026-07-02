import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser('userId') userId: string) {
    return this.notificationsService.findAllForUser(userId);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser('userId') userId: string) {
    const count = await this.notificationsService.countUnread(userId);
    return { count };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    const modified = await this.notificationsService.markAllAsRead(userId);
    return { modified };
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
