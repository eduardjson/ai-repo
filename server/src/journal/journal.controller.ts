import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { StockMovementListResponseDto } from '../dto/journal.response';

@ApiTags('journal')
@ApiBearerAuth()
@Controller('journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Get()
  @ApiOkResponse({ type: StockMovementListResponseDto })
  findAll(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const p = Math.max(1, parseInt(page || '1'));
    const s = Math.min(200, Math.max(1, parseInt(size || '20')));
    return this.journalService.findAll({ page: p, size: s, type, search, warehouseId, from, to });
  }
}
