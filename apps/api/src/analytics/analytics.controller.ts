import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import {
  CategoryBreakdownQueryDto,
  MonthlyTrendsQueryDto,
  UpcomingPaymentsQueryDto,
} from './dto/query-analytics.dto';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** Everything the dashboard needs, in a single round trip. */
  @Get('summary')
  getSummary(@CurrentUser('userId') userId: string) {
    return this.analyticsService.getSummary(userId);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(
    @CurrentUser('userId') userId: string,
    @Query() query: CategoryBreakdownQueryDto,
  ) {
    return this.analyticsService.getCategoryBreakdown(userId, query);
  }

  @Get('monthly-trends')
  getMonthlyTrends(
    @CurrentUser('userId') userId: string,
    @Query() query: MonthlyTrendsQueryDto,
  ) {
    return this.analyticsService.getMonthlyTrends(userId, query.months);
  }

  @Get('budget-status')
  getBudgetStatus(@CurrentUser('userId') userId: string) {
    return this.analyticsService.getBudgetStatus(userId);
  }

  @Get('upcoming-payments')
  getUpcomingPayments(
    @CurrentUser('userId') userId: string,
    @Query() query: UpcomingPaymentsQueryDto,
  ) {
    return this.analyticsService.getUpcomingPayments(userId, query.days);
  }
}
