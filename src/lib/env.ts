function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL", "postgresql://dyafa:dyafa@localhost:5432/dyafa_development"),
  nextAuthUrl: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "dev-only-insecure-secret-change-me",

  adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? "admin@dyafa.com",
  adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!",
  adminSeedName: process.env.ADMIN_SEED_NAME ?? "Dyafa Admin",

  mailProvider: (process.env.MAIL_PROVIDER as "console" | "smtp" | "resend") ?? "console",
  mailFrom: process.env.MAIL_FROM ?? "Dyafa Development <no-reply@dyafa.com>",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  resendApiKey: process.env.RESEND_API_KEY,
  bdNotificationEmails: (process.env.BD_NOTIFICATION_EMAILS ?? "bd@dyafa.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean),

  whatsappNumber: process.env.WHATSAPP_NUMBER ?? "",

  analyticsProvider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? "none",
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID,

  storageDriver: (process.env.STORAGE_DRIVER as "local" | "s3") ?? "local",
  storageLocalDir: process.env.STORAGE_LOCAL_DIR ?? "./storage/uploads",
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
  },

  featureProjects: process.env.FEATURE_PROJECTS === "true",
  featureOpportunities: process.env.FEATURE_OPPORTUNITIES === "true",
  featureNews: process.env.FEATURE_NEWS === "true",
  featureCareers: process.env.FEATURE_CAREERS === "true",

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 10),

  jobRunnerMode: (process.env.JOB_RUNNER_MODE as "inline" | "cron") ?? "inline",
  cronSecret: process.env.CRON_SECRET,

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
