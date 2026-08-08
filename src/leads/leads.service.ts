import { Injectable, NotFoundException } from '@nestjs/common';
import { Lead } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async createContact(dto: CreateContactDto) {
    const fullName = dto.fullName.trim();
    const email = dto.email.trim().toLowerCase();
    const message = dto.message.trim();
    const phone = dto.phone?.trim() || null;
    const projectType =
      this.cleanOptional(dto.service) ||
      this.cleanOptional(dto.projectType);

    const subject =
      dto.subject?.trim() ||
      projectType ||
      'Website Contact';

    const lead = await this.prisma.lead.create({
      data: {
        formType: 'contact',
        status: 'new',
        fullName,
        email,
        phone,
        subject,
        message,
        companyName: this.cleanOptional(dto.companyName),
        projectType,
        estimatedBudget: this.cleanOptional(dto.estimatedBudget),
        preferredTimeline: this.cleanOptional(dto.preferredTimeline),
      },
    });

    return {
      message: 'Contact submitted successfully',
      lead: this.toPublic(lead),
    };
  }

  async findAll(filters?: { formType?: string; status?: string }) {
    const where: {
      formType?: string;
      status?: string;
    } = {};

    if (filters?.formType && filters.formType !== 'all') {
      where.formType = filters.formType;
    }

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: leads.length,
      leads: leads.map((item) => this.toPublic(item)),
    };
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto) {
    await this.ensureExists(id);

    const lead = await this.prisma.lead.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      lead: this.toPublic(lead),
    };
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead deleted successfully', id };
  }

  private async ensureExists(id: string) {
    const existing = await this.prisma.lead.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} not found`);
    }
  }

  private cleanOptional(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private toPublic(lead: Lead) {
    return {
      id: lead.id,
      form_type: lead.formType,
      status: lead.status,
      full_name: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      subject: lead.subject,
      message: lead.message,
      company_name: lead.companyName,
      project_type: lead.projectType,
      estimated_budget: lead.estimatedBudget,
      preferred_timeline: lead.preferredTimeline,
      created_at: lead.createdAt.toISOString(),
      updated_at: lead.updatedAt.toISOString(),
    };
  }
}
