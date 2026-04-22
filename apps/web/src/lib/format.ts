import { formatEther } from "ethers";

export function formatAddress(address: string, visible = 4) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 2 + visible)}...${address.slice(-visible)}`;
}

export function formatAvax(value: bigint) {
  const amount = Number(formatEther(value));
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: amount >= 10 ? 0 : 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

export function formatFullDate(timestamp: number) {
  if (!timestamp) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp * 1000);
}

export function formatRelativeTime(timestamp: number) {
  if (!timestamp) {
    return "No deadline";
  }

  const deltaSeconds = timestamp - Math.floor(Date.now() / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, size] of units) {
    if (Math.abs(deltaSeconds) >= size || unit === "minute") {
      return formatter.format(Math.round(deltaSeconds / size), unit);
    }
  }

  return "now";
}

export function isExpired(deadline: number) {
  return deadline !== 0 && deadline < Math.floor(Date.now() / 1000);
}

export function getRepoName(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    return (
      url.pathname.split("/").filter(Boolean).slice(0, 2).join("/") || repoUrl
    );
  } catch {
    return repoUrl;
  }
}
