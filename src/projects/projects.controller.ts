import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminSecretGuard } from '../common/guards/admin-secret.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

const uploadInterceptor = FileFieldsInterceptor(
  [
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 20 },
  ],
  {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  },
);

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /** Public — website / admin projects list */
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.projectsService.findAll({ status, featured, search, type });
  }

  /** Protected — admin dashboard stats (must be before :id) */
  @Get('admin/stats')
  @UseGuards(AdminSecretGuard)
  getStats() {
    return this.projectsService.getStats();
  }

  /** Public — single project by id or slug */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /** Protected — create project (JSON or multipart) */
  @Post()
  @UseGuards(AdminSecretGuard)
  @UseInterceptors(uploadInterceptor)
  create(
    @Body() dto: CreateProjectDto,
    @UploadedFiles()
    files?: {
      mainImage?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
  ) {
    return this.projectsService.create(dto, files);
  }

  /** Protected — update project */
  @Put(':id')
  @UseGuards(AdminSecretGuard)
  @UseInterceptors(uploadInterceptor)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @UploadedFiles()
    files?: {
      mainImage?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
  ) {
    return this.projectsService.update(id, dto, files);
  }

  /** Protected — delete project */
  @Delete(':id')
  @UseGuards(AdminSecretGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
