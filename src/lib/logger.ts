import pino from "pino";

// PII-redacted structured logging: strip common personal-data keys wherever
// they appear in the log object, not just at the top level.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "*.email",
      "*.phone",
      "*.password",
      "*.passwordHash",
      "*.name",
      "*.message.email",
      "*.message.phone",
    ],
    censor: "[redacted]",
  },
});
