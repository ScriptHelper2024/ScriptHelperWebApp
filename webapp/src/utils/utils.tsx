import { format, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";

export function formatDistanceToNowShort(date: Date | number): string {
  try {
    if (!date || isNaN(new Date(date).getTime())) {
      return "Invalid date";
    }
    const utcDate = zonedTimeToUtc(new Date(date), "UTC");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = utcToZonedTime(utcDate, timeZone);
    let distance = formatDistanceToNow(zonedDate, { addSuffix: false });
    distance = distance
      .replace("about ", "")
      .replace("less than a minute", "<1m")
      .replace(/(\d+)\sminutes?/, "$1m")
      .replace(/(\d+)\shours?/, "$1h")
      .replace(/(\d+)\sdays?/, "$1d")
      .replace(/(\d+)\smonths?/, "$1mo")
      .replace(/(\d+)\syears?/, "$1y");
    distance = distance.replace(/(\d+)([a-z]+)/, "$1$2");
    return distance + " ago";
  } catch (error) {
    console.error("Error formatting distance:", error);
    return "Error";
  }
}

export function formatDateAndTime(date: Date | number): string {
  try {
    if (!date || isNaN(new Date(date).getTime())) {
      return "Invalid date";
    }
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = utcToZonedTime(date, timeZone);
    return format(zonedDate, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
}

export function extractCharacters(text: string): string[] {
  const regex = /<([^<>]+)>/g;
  const matches = text.match(regex);
  if (!matches) return [];
  const uniqueCharactersSet = new Set(
    matches.map((match) => match.replace(/[<>]/g, ""))
  );
  const uniqueCharactersArray = Array.from(uniqueCharactersSet);
  return uniqueCharactersArray;
}
