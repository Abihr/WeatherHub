export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "greeting_morning";
  }

  if (hour >= 12 && hour < 17) {
    return "greeting_afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "greeting_evening";
  }

  return "greeting_night";
}

export function getGreetingRefreshDelay() {
  const now = new Date();

  const nextHour = new Date(now);

  nextHour.setHours(
    now.getHours() + 1,
    0,
    0,
    0
  );

  return nextHour.getTime() - now.getTime();
}