import { Module } from '@nestjs/common';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, AdminSecretGuard],
  exports: [LeadsService],
})
export class LeadsModule {}
