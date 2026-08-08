import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';

@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /** Public — website contact form */
  @Post('contacts')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  createContact(@Body() dto: CreateContactDto) {
    return this.leadsService.createContact(dto);
  }

  /** Protected — admin Leads page */
  @Get('admin/leads')
  @UseGuards(AdminSecretGuard)
  findAll(
    @Query('formType') formType?: string,
    @Query('status') status?: string,
  ) {
    return this.leadsService.findAll({ formType, status });
  }

  /** Protected — mark new / read / replied */
  @Patch('admin/leads/:id/status')
  @UseGuards(AdminSecretGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    return this.leadsService.updateStatus(id, dto);
  }

  /** Protected — delete a lead */
  @Delete('admin/leads/:id')
  @UseGuards(AdminSecretGuard)
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
