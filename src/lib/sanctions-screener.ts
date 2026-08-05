export interface SanctionsResult {
  matched: boolean;
  listName: string | null;
  confidence: number;
  reason: string | null;
}

const MOCK_WATCHLIST: Record<string, { list: string; reason: string }> = {
  '0xDEAD0000000000000000000000000000DEADBEEF': {
    list: 'OFAC-SDN',
    reason: 'Sanctions evasion — North Korea nexus',
  },
  '0xBAD00000000000000000000000000000000BAD00': {
    list: 'FATF-BLACKLIST',
    reason: 'Terrorist financing',
  },
  '0xF00D000000000000000000000000000000F00D00': {
    list: 'EU-CONSOLIDATED',
    reason: 'Proliferation financing',
  },
};

export class SanctionsScreener {
  screen(address: string): SanctionsResult {
    const normalized = address.toLowerCase();
    const entry = Object.entries(MOCK_WATCHLIST).find(
      ([addr]) => addr.toLowerCase() === normalized
    );

    if (entry) {
      return {
        matched: true,
        listName: entry[1].list,
        confidence: 99,
        reason: entry[1].reason,
      };
    }

    // Fuzzy heuristic: addresses starting with 0x000 are suspicious
    if (normalized.startsWith('0x000')) {
      return {
        matched: false,
        listName: null,
        confidence: 35,
        reason: 'Potential mixer output address',
      };
    }

    return { matched: false, listName: null, confidence: 0, reason: null };
  }

  batchScreen(addresses: string[]): Map<string, SanctionsResult> {
    const results = new Map<string, SanctionsResult>();
    for (const addr of addresses) {
      results.set(addr, this.screen(addr));
    }
    return results;
  }
}

export const sanctionsScreener = new SanctionsScreener();
