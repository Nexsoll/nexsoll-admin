import { Module } from '@nestjs/common';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, AdminSecretGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
