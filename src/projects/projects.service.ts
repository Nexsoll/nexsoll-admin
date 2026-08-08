import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

type UploadedFiles = {
  mainImage?: Express.Multer.File[];
  galleryImages?: Express.Multer.File[];
};

@Injectable()
export class ProjectsService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'projects');

  constructor(private readonly prisma: PrismaService) {
    fs.mkdirSync(this.uploadsDir, { recursive: true });
  }

  async findAll(query?: {
    status?: string;
    featured?: string;
    search?: string;
    type?: string;
  }) {
    const where: Prisma.ProjectWhereInput = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.featured === 'true') {
      where.isFeatured = true;
    }

    if (query?.type) {
      where.projectType = query.type;
    }

    if (query?.search) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
        { client: { contains: term, mode: 'insensitive' } },
        { desc: { contains: term, mode: 'insensitive' } },
      ];
    }

    const projects = await this.prisma.project.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      count: projects.length,
      projects: projects.map((project) => this.toPublic(project)),
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    return this.toPublic(project);
  }

  async create(dto: CreateProjectDto, files?: UploadedFiles) {
    const slug = this.normalizeSlug(dto.slug || dto.title);
    await this.ensureSlugAvailable(slug);

    const imageUrls = this.persistUploadedFiles(files);
    const mainImage = files?.mainImage?.[0]
      ? imageUrls[0]
      : imageUrls[0] ?? null;
    const galleryStart = files?.mainImage?.[0] ? 1 : 0;
    const gallery = imageUrls.slice(galleryStart);

    const project = await this.prisma.project.create({
      data: {
        title: dto.title.trim(),
        slug,
        category: dto.category?.trim() || '',
        projectType: this.cleanOptional(dto.projectType),
        desc: dto.desc.trim(),
        image: mainImage,
        link: this.cleanOptional(dto.link),
        client: this.cleanOptional(dto.client),
        timeline: this.cleanOptional(dto.timeline),
        services: this.cleanOptional(dto.services),
        overview: this.cleanOptional(dto.overview),
        challenge: this.cleanOptional(dto.challenge),
        solution: this.cleanOptional(dto.solution),
        clientRequirement: this.cleanOptional(dto.clientRequirement),
        howWeFulfilled: this.cleanOptional(dto.howWeFulfilled),
        keyFeatures: dto.keyFeatures ?? [],
        techStack: dto.techStack ?? [],
        process: dto.process ?? [],
        outcomes: dto.outcomes ?? [],
        tags: dto.tags ?? [],
        gallery,
        results: (dto.results ?? []) as Prisma.InputJsonValue,
        ctaTitle: this.cleanOptional(dto.ctaTitle),
        accent: this.cleanOptional(dto.accent),
        theme: (dto.theme ?? null) as Prisma.InputJsonValue,
        status: dto.status || 'draft',
        isFeatured: dto.isFeatured ?? false,
      },
    });

    return this.toPublic(project);
  }

  async update(id: string, dto: UpdateProjectDto, files?: UploadedFiles) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    let slug = existing.slug;
    if (dto.slug !== undefined || dto.title !== undefined) {
      slug = this.normalizeSlug(dto.slug || dto.title || existing.slug);
      if (slug !== existing.slug) {
        await this.ensureSlugAvailable(slug, id);
      }
    }

    const imageUrls = this.persistUploadedFiles(files);
    let image = existing.image;
    let gallery = [...existing.gallery];

    if (files?.mainImage?.[0] && imageUrls[0]) {
      if (existing.image) {
        this.tryDeleteLocalFile(existing.image);
      }
      image = imageUrls[0];
    }

    const galleryUploads = files?.mainImage?.[0]
      ? imageUrls.slice(1)
      : imageUrls;

    if (galleryUploads.length > 0) {
      gallery = [...gallery, ...galleryUploads];
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        slug,
        category:
          dto.category !== undefined ? dto.category.trim() || '' : undefined,
        projectType:
          dto.projectType !== undefined
            ? this.cleanOptional(dto.projectType)
            : undefined,
        desc: dto.desc !== undefined ? dto.desc.trim() : undefined,
        image,
        link: dto.link !== undefined ? this.cleanOptional(dto.link) : undefined,
        client:
          dto.client !== undefined ? this.cleanOptional(dto.client) : undefined,
        timeline:
          dto.timeline !== undefined
            ? this.cleanOptional(dto.timeline)
            : undefined,
        services:
          dto.services !== undefined
            ? this.cleanOptional(dto.services)
            : undefined,
        overview:
          dto.overview !== undefined
            ? this.cleanOptional(dto.overview)
            : undefined,
        challenge:
          dto.challenge !== undefined
            ? this.cleanOptional(dto.challenge)
            : undefined,
        solution:
          dto.solution !== undefined
            ? this.cleanOptional(dto.solution)
            : undefined,
        clientRequirement:
          dto.clientRequirement !== undefined
            ? this.cleanOptional(dto.clientRequirement)
            : undefined,
        howWeFulfilled:
          dto.howWeFulfilled !== undefined
            ? this.cleanOptional(dto.howWeFulfilled)
            : undefined,
        keyFeatures: dto.keyFeatures,
        techStack: dto.techStack,
        process: dto.process,
        outcomes: dto.outcomes,
        tags: dto.tags,
        gallery,
        results:
          dto.results !== undefined
            ? (dto.results as Prisma.InputJsonValue)
            : undefined,
        ctaTitle:
          dto.ctaTitle !== undefined
            ? this.cleanOptional(dto.ctaTitle)
            : undefined,
        accent:
          dto.accent !== undefined ? this.cleanOptional(dto.accent) : undefined,
        theme:
          dto.theme !== undefined
            ? (dto.theme as Prisma.InputJsonValue)
            : undefined,
        status: dto.status,
        isFeatured: dto.isFeatured,
      },
    });

    return this.toPublic(project);
  }

  async remove(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    if (existing.image) {
      this.tryDeleteLocalFile(existing.image);
    }

    for (const imagePath of existing.gallery) {
      this.tryDeleteLocalFile(imagePath);
    }

    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully', id };
  }

  async getStats() {
    const [total, published, draft, inProgress, completed, archived, featured] =
      await Promise.all([
        this.prisma.project.count(),
        this.prisma.project.count({ where: { status: 'published' } }),
        this.prisma.project.count({ where: { status: 'draft' } }),
        this.prisma.project.count({ where: { status: 'in_progress' } }),
        this.prisma.project.count({ where: { status: 'completed' } }),
        this.prisma.project.count({ where: { status: 'archived' } }),
        this.prisma.project.count({ where: { isFeatured: true } }),
      ]);

    return {
      total,
      published,
      draft,
      inProgress,
      completed,
      archived,
      featured,
    };
  }

  private async ensureSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(`Slug "${slug}" is already in use`);
    }
  }

  private normalizeSlug(value: string) {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      throw new BadRequestException('A valid slug is required');
    }

    return slug;
  }

  private persistUploadedFiles(files?: UploadedFiles): string[] {
    if (!files) {
      return [];
    }

    const allFiles = [
      ...(files.mainImage ?? []),
      ...(files.galleryImages ?? []),
    ];

    const urls: string[] = [];

    for (const file of allFiles) {
      const ext = path.extname(file.originalname) || '.jpg';
      const filename = `${Date.now()}-${randomUUID()}${ext}`;
      const dest = path.join(this.uploadsDir, filename);
      fs.writeFileSync(dest, file.buffer);
      urls.push(`/uploads/projects/${filename}`);
    }

    return urls;
  }

  private tryDeleteLocalFile(publicPath: string) {
    if (!publicPath.startsWith('/uploads/projects/')) {
      return;
    }

    const absolute = path.join(process.cwd(), publicPath.replace(/^\//, ''));
    if (fs.existsSync(absolute)) {
      fs.unlinkSync(absolute);
    }
  }

  private cleanOptional(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private toPublic(project: Project) {
    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      category: project.category,
      project_type: project.projectType,
      desc: project.desc,
      image: project.image,
      link: project.link,
      client: project.client,
      timeline: project.timeline,
      services: project.services,
      overview: project.overview,
      challenge: project.challenge,
      solution: project.solution,
      client_requirement: project.clientRequirement,
      how_we_fulfilled: project.howWeFulfilled,
      key_features: project.keyFeatures,
      tech_stack: project.techStack,
      process: project.process,
      results: project.results,
      outcomes: project.outcomes,
      gallery: project.gallery,
      cta_title: project.ctaTitle,
      tags: project.tags,
      accent: project.accent,
      theme: project.theme,
      status: project.status,
      is_featured: project.isFeatured,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
    };
  }
}
