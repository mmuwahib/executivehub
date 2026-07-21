export function formatHeaderDate(date: Date = new Date()): string {
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Asia/Dubai",
  });
  const day = date.toLocaleDateString("en-US", {
    day: "2-digit",
    timeZone: "Asia/Dubai",
  });
  const month = date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "Asia/Dubai",
  });
  const year = date.toLocaleDateString("en-US", {
    year: "numeric",
    timeZone: "Asia/Dubai",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Dubai",
  });
  return `${weekday}, ${day} ${month} ${year} · ${time} GULF TIME`.toUpperCase();
}

export function formatWeekOf(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Dubai",
  });
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
