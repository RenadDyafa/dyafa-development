"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-alert">500</p>
      <h1 className="mt-2 text-2xl font-bold text-navy-900">{t("title")}</h1>
      <p className="mt-3 text-slate">{t("body")}</p>
      <Button onClick={reset} className="mt-8">
        {t("retry")}
      </Button>
    </section>
  );
}
