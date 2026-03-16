export class IdGenerator {
  private readonly counters = new Map<string, number>();

  constructor(private readonly testRunId: string) {}

  next(prefix: string): string {
    const currentCount = this.counters.get(prefix) ?? 0;
    const nextCount = currentCount + 1;
    this.counters.set(prefix, nextCount);

    return `${prefix}-${this.testRunId}-${String(nextCount).padStart(4, "0")}`;
  }
}
