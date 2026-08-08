import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'Nexsoll Admin API',
      message: 'Projects and contact leads API for Nexsoll',
      docs: '/api',
      public: {
        listProjects: 'GET /projects',
        getProject: 'GET /projects/:id',
        createContact: 'POST /contacts',
      },
      admin: {
        createProject: 'POST /projects',
        updateProject: 'PUT /projects/:id',
        deleteProject: 'DELETE /projects/:id',
        projectStats: 'GET /projects/admin/stats',
        listLeads: 'GET /admin/leads',
        updateLeadStatus: 'PATCH /admin/leads/:id/status',
        deleteLead: 'DELETE /admin/leads/:id',
        header: 'x-admin-secret',
      },
    };
  }
}
