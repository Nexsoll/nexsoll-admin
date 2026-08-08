-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "project_type" TEXT,
    "desc" TEXT NOT NULL,
    "image" TEXT,
    "link" TEXT,
    "client" TEXT,
    "timeline" TEXT,
    "services" TEXT,
    "overview" TEXT,
    "challenge" TEXT,
    "solution" TEXT,
    "client_requirement" TEXT,
    "how_we_fulfilled" TEXT,
    "key_features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tech_stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "process" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "results" JSONB NOT NULL DEFAULT '[]',
    "cta_title" TEXT,
    "accent" TEXT,
    "theme" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "form_type" TEXT NOT NULL DEFAULT 'contact',
    "status" TEXT NOT NULL DEFAULT 'new',
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "company_name" TEXT,
    "project_type" TEXT,
    "estimated_budget" TEXT,
    "preferred_timeline" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_is_featured_idx" ON "projects"("is_featured");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");

-- CreateIndex
CREATE INDEX "leads_form_type_idx" ON "leads"("form_type");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");
