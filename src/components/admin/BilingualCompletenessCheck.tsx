export function BilingualCompletenessCheck({ textEn, textAr }: { textEn: string; textAr: string }) {
  const arEmpty = textAr.trim().length === 0;
  const identical = !arEmpty && textAr.trim() === textEn.trim();
  const ok = !arEmpty && !identical;

  return (
    <p className={"text-xs font-medium " + (ok ? "text-teal-600" : "text-alert")}>
      {ok
        ? "Bilingual completeness: OK"
        : arEmpty
          ? "Arabic content is empty."
          : "Arabic content is identical to English (not translated)."}
    </p>
  );
}
