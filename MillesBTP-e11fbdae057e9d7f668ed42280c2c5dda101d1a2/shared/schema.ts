import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Utilisateurs
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chantiers
export const chantiers = pgTable("chantiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  nom: text("nom").notNull(),
  client: text("client").notNull(),
  adresse: text("adresse"),
  typeChantier: text("type_chantier"), // type de chantier pour segmentation
  statutAdministratif: text("statut_administratif").default("en_cours"), // en_cours, termine, annule
  statutReel: text("statut_reel").default("non_mesure"), // non_mesure, sous_controle, a_surveiller, a_risque
  margeReference: numeric("marge_reference", { precision: 10, scale: 2 }).default("0"), // marge objectif du devis
  coutsEngages: numeric("couts_engages", { precision: 10, scale: 2 }).default("0"), // coûts réels engagés
  delaiPrevu: integer("delai_prevu"), // en jours
  delaiProjete: integer("delai_projete"), // en jours
  dateDebut: timestamp("date_debut"),
  dateFinPrevue: timestamp("date_fin_prevue"),
  dateFinReelle: timestamp("date_fin_reelle"),
  montantTotal: numeric("montant_total", { precision: 10, scale: 2 }).default("0"),
  dernierActivite: timestamp("dernier_activite"), // dernière activité terrain
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types d'écarts
export const typeEcart = z.enum(["terrain", "client", "mo", "interne"]);

// Écarts
export const ecarts = pgTable("ecarts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chantierId: varchar("chantier_id").notNull().references(() => chantiers.id),
  type: text("type").notNull(), // terrain, client, mo, interne
  description: text("description").notNull(),
  impactDelai: integer("impact_delai").default(0), // en jours
  impactCout: numeric("impact_cout", { precision: 10, scale: 2 }).default("0"),
  impactMarge: numeric("impact_marge", { precision: 10, scale: 2 }).default("0"),
  statut: text("statut").default("nouveau"), // nouveau, en_decision, avenant_cree, resolu, ignore
  photos: jsonb("photos").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Décisions
export const decisions = pgTable("decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ecartId: varchar("ecart_id").references(() => ecarts.id),
  chantierId: varchar("chantier_id").notNull().references(() => chantiers.id),
  type: text("type").notNull(), // creer_avenant, absorber_ecart, negocier, autre
  question: text("question").notNull(),
  impactEstime: numeric("impact_estime", { precision: 10, scale: 2 }).default("0"),
  deadline: timestamp("deadline"),
  statut: text("statut").default("en_attente"), // en_attente, prise, non_prise, expiree
  responsable: varchar("responsable_id").references(() => users.id),
  decision: text("decision"), // réponse si prise
  priseLe: timestamp("prise_le"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Avenants
export const avenants = pgTable("avenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ecartId: varchar("ecart_id").references(() => ecarts.id),
  chantierId: varchar("chantier_id").notNull().references(() => chantiers.id),
  numero: text("numero").notNull(),
  description: text("description").notNull(),
  montant: numeric("montant", { precision: 10, scale: 2 }).default("0"),
  delaiSupplementaire: integer("delai_supplementaire").default(0),
  statut: text("statut").default("brouillon"), // brouillon, envoye, negocie, valide, refuse
  envoyeLe: timestamp("envoye_le"),
  valideLe: timestamp("valide_le"),
  refuseLe: timestamp("refuse_le"),
  raisonRefus: text("raison_refus"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Événements terrain (Journal terrain)
export const evenementsTerrain = pgTable("evenements_terrain", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chantierId: varchar("chantier_id").notNull().references(() => chantiers.id),
  type: text("type").notNull(), // photo, note, appel, retard, alea, changement
  titre: text("titre"),
  description: text("description"),
  photos: jsonb("photos").$type<string[]>().default([]),
  impactDelai: integer("impact_delai").default(0),
  impactCout: numeric("impact_cout", { precision: 10, scale: 2 }).default("0"),
  ecartId: varchar("ecart_id").references(() => ecarts.id), // lien vers écart si applicable
  auteur: varchar("auteur_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alertes
export const alertes = pgTable("alertes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chantierId: varchar("chantier_id").references(() => chantiers.id),
  ecartId: varchar("ecart_id").references(() => ecarts.id),
  decisionId: varchar("decision_id").references(() => decisions.id),
  type: text("type").notNull(), // critique, a_surveiller, silencieux, decision_en_attente
  titre: text("titre").notNull(),
  description: text("description"),
  impactEstime: numeric("impact_estime", { precision: 10, scale: 2 }).default("0"),
  urgence: text("urgence").default("moyenne"), // faible, moyenne, elevee, critique
  statut: text("statut").default("active"), // active, resolue, ignoree
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Schémas Zod pour validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  companyName: true,
});

export const insertChantierSchema = createInsertSchema(chantiers).pick({
  nom: true,
  client: true,
  adresse: true,
  margePrevue: true,
  delaiPrevu: true,
  dateDebut: true,
  dateFinPrevue: true,
  montantTotal: true,
});

export const insertEcartSchema = createInsertSchema(ecarts).pick({
  chantierId: true,
  type: true,
  description: true,
  impactDelai: true,
  impactCout: true,
  photos: true,
});

export const insertDecisionSchema = createInsertSchema(decisions).pick({
  ecartId: true,
  chantierId: true,
  type: true,
  question: true,
  impactEstime: true,
  deadline: true,
  responsable: true,
});

export const insertAvenantSchema = createInsertSchema(avenants).pick({
  ecartId: true,
  chantierId: true,
  numero: true,
  description: true,
  montant: true,
  delaiSupplementaire: true,
});

export const insertEvenementTerrainSchema = createInsertSchema(evenementsTerrain).pick({
  chantierId: true,
  type: true,
  titre: true,
  description: true,
  photos: true,
  impactDelai: true,
  impactCout: true,
});

// Types TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Chantier = typeof chantiers.$inferSelect;
export type InsertChantier = z.infer<typeof insertChantierSchema>;
export type Ecart = typeof ecarts.$inferSelect;
export type InsertEcart = z.infer<typeof insertEcartSchema>;
export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type Avenant = typeof avenants.$inferSelect;
export type InsertAvenant = z.infer<typeof insertAvenantSchema>;
export type EvenementTerrain = typeof evenementsTerrain.$inferSelect;
export type InsertEvenementTerrain = z.infer<typeof insertEvenementTerrainSchema>;
export type Alerte = typeof alertes.$inferSelect;
