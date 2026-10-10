/**
 * Token Bucket Rate Limiter with Exponential Backoff & Jitter
 * Standard distributed systems rate-limiting algorithm.
 */
export class TokenBucketRateLimiter {
  /**
   * @param {number} rps Requests per second
   * @param {number} burstCapacity Maximum token burst capacity
   */
  constructor(rps = 5, burstCapacity = null) {
    this.rps = Math.max(1, Number(rps) || 5);
    this.capacity = burstCapacity ? Math.max(burstCapacity, this.rps) : this.rps * 2;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Refills tokens based on elapsed time
   */
  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsedSec * this.rps;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Asynchronously consumes token(s), waiting if bucket is empty
   * @param {number} count Number of tokens to consume
   */
  async consume(count = 1) {
    while (true) {
      this.refill();

      if (this.tokens >= count) {
        this.tokens -= count;
        return;
      }

      // Calculate required wait time for next token
      const missingTokens = count - this.tokens;
      const waitMs = Math.ceil((missingTokens / this.rps) * 1000);
      await new Promise(resolve => setTimeout(resolve, Math.max(waitMs, 20)));
    }
  }

  /**
   * Updates rate limit dynamically (e.g. from robots.txt crawl-delay)
   * @param {number} newRps 
   */
  setRate(newRps) {
    this.refill();
    this.rps = Math.max(0.5, Number(newRps));
    this.capacity = Math.max(this.rps * 2, 2);
  }

  /**
   * Exponential backoff with full jitter to avoid thundering herd on 429 errors
   * @param {number} attempt Current retry attempt (0, 1, 2...)
   * @param {number} baseMs Base backoff milliseconds (default 1000)
   * @param {number} maxMs Maximum backoff milliseconds (default 15000)
   * @returns {Promise<number>} Actual delay waited in milliseconds
   */
  async waitBackoff(attempt, baseMs = 1000, maxMs = 15000) {
    const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
    const jitter = Math.random() * (exponential * 0.3); // 30% random jitter
    const delay = Math.floor(exponential + jitter);
    await new Promise(resolve => setTimeout(resolve, delay));
    return delay;
  }
}
