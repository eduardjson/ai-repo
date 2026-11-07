import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'
import { DashboardSummaryDto } from '../dto/dashboard.response'

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOkResponse({ type: DashboardSummaryDto })
  getSummary() {
    return this.dashboardService.getSummary()
  }
}
