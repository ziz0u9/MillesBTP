import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Utilisateurs (Conducteurs de travaux)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  full_name: text("full_name"),
  role: text("role").default("project_manager"), // "project_manager" | "admin"
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Entreprises (employeurs des conducteurs de travaux)
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  siret: text("siret"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Clients
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  company_id: varchar("company_id").references(() => companies.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// CHANTIERS - ÉLÉMENT CENTRAL
export const worksites = pgTable("worksites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  client_id: varchar("client_id").references(() => clients.id, { onDelete: "set null" }).notNull(),
  
  // Informations générales
  name: text("name").notNull(), // Nom du chantier
  code: text("code"), // Code interne du chantier
  address: text("address").notNull(), // Adresse du chantier
  type: text("type"), // Type de chantier (ex: "Construction", "Rénovation", "Aménagement")
  description: text("description"), // Description du chantier
  
  // Dates
  start_date: timestamp("start_date"),
  planned_end_date: timestamp("planned_end_date"),
  actual_end_date: timestamp("actual_end_date"),
  
  // Responsable
  manager_name: text("manager_name"), // Nom du conducteur de travaux responsable
  
  // Suivi financier - CŒUR DÉCISIONNEL
  budget_initial: decimal("budget_initial", { precision: 12, scale: 2 }).notNull().default("0"), // Budget initial
  costs_estimated: decimal("costs_estimated", { precision: 12, scale: 2 }).notNull().default("0"), // Coûts estimés (manuellement saisis)
  costs_committed: decimal("costs_committed", { precision: 12, scale: 2 }).notNull().default("0"), // Coûts engagés (réels)
  margin_estimated: decimal("margin_estimated", { precision: 12, scale: 2 }), // Marge estimée (calculée)
  margin_percentage: decimal("margin_percentage", { precision: 5, scale: 2 }), // Pourcentage de marge
  
  // Statut de rentabilité
  profitability_status: text("profitability_status").notNull().default("profitable"), // "profitable" | "watch" | "at_risk"
  
  // Alertes
  has_budget_alert: boolean("has_budget_alert").default(false), // Dépassement budget
  has_amendment_alert: boolean("has_amendment_alert").default(false), // Avenant non validé
  has_admin_alert: boolean("has_admin_alert").default(false), // Retard administratif
  
  // Statut général
  status: text("status").notNull().default("active"), // "active" | "completed" | "archived" | "cancelled"
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// COÛTS DÉTAILLÉS (Par catégorie - CŒUR MÉTIER)
export const worksite_costs = pgTable("worksite_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worksite_id: varchar("worksite_id").references(() => worksites.id, { onDelete: "cascade" }).notNull(),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Catégorie de coût
  category: text("category").notNull(), // "labor" | "materials" | "subcontracting" | "other"
  
  // Montant et description
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // Montant du coût
  description: text("description"), // Description du coût (ex: "Béton C25/30", "Heures MO équipe 2")
  
  // Date et référence
  cost_date: timestamp("cost_date").defaultNow().notNull(), // Date du coût
  reference: text("reference"), // Référence externe (facture, bon de commande, etc.)
  
  // Type : estimé ou réel
  type: text("type").notNull().default("committed"), // "estimated" | "committed"
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ÉVÉNEMENTS CHANTIER (Timeline / Historique)
export const worksite_events = pgTable("worksite_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worksite_id: varchar("worksite_id").references(() => worksites.id, { onDelete: "cascade" }).notNull(),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Type d'événement
  event_type: text("event_type").notNull(), // "creation" | "cost_added" | "cost_updated" | "amendment_created" | "amendment_approved" | "amendment_rejected" | "status_changed" | "budget_updated"
  
  // Description
  title: text("title").notNull(), // Titre de l'événement
  description: text("description"), // Description détaillée
  
  // Métadonnées (JSON pour flexibilité)
  metadata: jsonb("metadata"), // Ex: { cost_id: "...", amount: 1000, category: "materials", old_status: "profitable", new_status: "watch" }
  
  event_date: timestamp("event_date").defaultNow().notNull(),
  
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// AVENANTS (Changements / Modifications)
export const amendments = pgTable("amendments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worksite_id: varchar("worksite_id").references(() => worksites.id, { onDelete: "cascade" }).notNull(),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Description du changement
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Impact estimé
  time_impact_hours: integer("time_impact_hours"), // Impact temps en heures
  cost_impact: decimal("cost_impact", { precision: 12, scale: 2 }).notNull().default("0"), // Impact coût
  
  // Statut
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected"
  
  // Dates
  requested_at: timestamp("requested_at").defaultNow().notNull(),
  decided_at: timestamp("decided_at"),
  decision_notes: text("decision_notes"), // Notes de décision
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// DOCUMENTS (Administratif léger)
export const worksite_documents = pgTable("worksite_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worksite_id: varchar("worksite_id").references(() => worksites.id, { onDelete: "cascade" }).notNull(),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  name: text("name").notNull(), // Nom du document
  file_url: text("file_url"), // URL du fichier (Supabase Storage)
  file_type: text("file_type"), // Type de fichier (PDF, image, etc.)
  category: text("category"), // Catégorie automatique (ex: "Devis", "Facture", "Photo", "Rapport")
  notes: text("notes"), // Notes supplémentaires
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// COMPTES RENDUS / HISTORIQUE
export const worksite_reports = pgTable("worksite_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worksite_id: varchar("worksite_id").references(() => worksites.id, { onDelete: "cascade" }).notNull(),
  user_id: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  title: text("title").notNull(),
  content: text("content").notNull(), // Contenu du compte rendu
  report_date: timestamp("report_date").defaultNow().notNull(),
  
  // Métadonnées pour export
  exported_at: timestamp("exported_at"),
  exported_format: text("exported_format"), // "pdf" | "email"
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// NOTE: Les modules suivants (calls, mails, quotes, invoices, orders, tasks) 
// ont été supprimés car ils ne sont pas dans le scope du produit selon le cadrage.
// Le produit se concentre uniquement sur la gestion de chantiers (worksites).

// Schémas de validation Zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  full_name: true,
  role: true,
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  user_id: true,
  name: true,
  siret: true,
  address: true,
  phone: true,
  email: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  user_id: true,
  company_id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  notes: true,
});

export const insertWorksiteSchema = createInsertSchema(worksites).pick({
  user_id: true,
  client_id: true,
  name: true,
  code: true,
  address: true,
  type: true,
  description: true,
  start_date: true,
  planned_end_date: true,
  manager_name: true,
  budget_initial: true,
  costs_estimated: true,
  costs_committed: true,
  status: true,
});

export const insertAmendmentSchema = createInsertSchema(amendments).pick({
  worksite_id: true,
  user_id: true,
  title: true,
  description: true,
  time_impact_hours: true,
  cost_impact: true,
  status: true,
});

export const insertWorksiteDocumentSchema = createInsertSchema(worksite_documents).pick({
  worksite_id: true,
  user_id: true,
  name: true,
  file_url: true,
  file_type: true,
  category: true,
  notes: true,
});

export const insertWorksiteReportSchema = createInsertSchema(worksite_reports).pick({
  worksite_id: true,
  user_id: true,
  title: true,
  content: true,
  report_date: true,
});

// Types TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Worksite = typeof worksites.$inferSelect;
export type WorksiteCost = typeof worksite_costs.$inferSelect;
export type WorksiteEvent = typeof worksite_events.$inferSelect;
export type Amendment = typeof amendments.$inferSelect;
export type WorksiteDocument = typeof worksite_documents.$inferSelect;
export type WorksiteReport = typeof worksite_reports.$inferSelect;

