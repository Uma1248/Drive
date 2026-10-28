import { ScannedFile } from '../types';

export interface SamplePackage {
  id: string;
  name: string;
  clientName: string;
  category: string;
  description: string;
  files: ScannedFile[];
}

export const SAMPLE_PACKAGES: SamplePackage[] = [
  {
    id: 'pkg-ecommerce-fullstack',
    name: 'CyberStore Next-Gen Checkout & Cart Engine',
    clientName: 'Apex Quantum Retail Ltd.',
    category: 'Full-Stack Web Deliverable',
    description: 'Production-ready shopping cart, discount calculation service, Stripe webhook handler, and test suite.',
    files: [
      {
        name: 'package.json',
        path: 'checkout-engine/package.json',
        size: 1420,
        type: 'application/json',
        content: JSON.stringify(
          {
            name: 'cyberstore-checkout',
            version: '2.4.0',
            dependencies: {
              express: '^4.21.0',
              stripe: '^14.2.0',
              zod: '^3.23.8',
              ioredis: '^5.4.1',
            },
            scripts: {
              test: 'vitest run --coverage',
              build: 'tsc -p tsconfig.build.json',
            },
          },
          null,
          2
        ),
      },
      {
        name: 'cart.service.ts',
        path: 'checkout-engine/src/services/cart.service.ts',
        size: 3840,
        type: 'text/typescript',
        content: `// Cart Service - High Throughput Order Engine
import { CartItem, DiscountCoupon, PriceBreakdown } from '../types';

export class CartService {
  private taxRate = 0.0825;

  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  applyDiscount(subtotal: number, coupon?: DiscountCoupon): number {
    if (!coupon) return 0;
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.value) / 100;
    }
    return Math.min(subtotal, coupon.value);
  }

  computeFinalBreakdown(items: CartItem[], coupon?: DiscountCoupon): PriceBreakdown {
    const subtotal = this.calculateSubtotal(items);
    const discount = this.applyDiscount(subtotal, coupon);
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * this.taxRate * 100) / 100;
    const total = taxableAmount + tax;

    return { subtotal, discount, tax, total };
  }
}`,
      },
      {
        name: 'stripe.webhook.ts',
        path: 'checkout-engine/src/controllers/stripe.webhook.ts',
        size: 2950,
        type: 'text/typescript',
        content: `import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(\`Webhook Signature Verification Failed: \${err.message}\`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await fulfillOrder(session.id, session.customer_details?.email);
  }

  res.json({ received: true });
}

async function fulfillOrder(sessionId: string, email?: string | null) {
  console.log(\`Fulfilling order for session \${sessionId} (Client: \${email})\`);
}`,
      },
      {
        name: 'README.md',
        path: 'checkout-engine/README.md',
        size: 2150,
        type: 'text/markdown',
        content: `# CyberStore Checkout & Cart Engine v2.4

### Deliverable Overview
This deliverable completes Milestone 3 of the Apex Quantum Retail modernization contract.
Includes cart session synchronization, idempotency key verification, and automated unit test suite.

### Architecture Highlights
- Isolated transactional domain model
- Zero-drift floating point arithmetic with cents normalization
- High-concurrency Redis lock on inventory decrements

### Deployment Instructions
1. Run \`npm install\`
2. Configure environment credentials in \`.env.production\`
3. Execute \`npm test\` to verify 100% test coverage suite
`,
      },
      {
        name: 'cart.test.ts',
        path: 'checkout-engine/tests/cart.test.ts',
        size: 2200,
        type: 'text/typescript',
        content: `import { describe, it, expect } from 'vitest';
import { CartService } from '../src/services/cart.service';

describe('CartService', () => {
  const service = new CartService();

  it('correctly calculates breakdown with 15% discount coupon', () => {
    const items = [
      { id: 'SKU-01', name: 'Cyberdeck MkIV', unitPrice: 100, quantity: 2 },
      { id: 'SKU-02', name: 'Neural Link Adapter', unitPrice: 50, quantity: 1 }
    ];
    const coupon = { code: 'SAVE15', type: 'percentage' as const, value: 15 };

    const result = service.computeFinalBreakdown(items, coupon);
    expect(result.subtotal).toBe(250);
    expect(result.discount).toBe(37.5);
    expect(result.total).toBeCloseTo(230.03, 1);
  });
});`,
      },
    ],
  },
  {
    id: 'pkg-fintech-analytics',
    name: 'VaultPulse Real-Time Financial Ledger & Risk Engine',
    clientName: 'Meridian Capital Partners',
    category: 'Fintech & Risk Modeling',
    description: 'Double-entry bookkeeping validation, risk anomaly scoring, and daily reconciliation report generator.',
    files: [
      {
        name: 'ledger.py',
        path: 'vaultpulse/core/ledger.py',
        size: 3400,
        type: 'text/x-python',
        content: `"""Double-entry ledger core with cryptographic transaction hash validation."""
import hashlib
from datetime import datetime
from typing import List, Dict

class LedgerEntry:
    def __init__(self, account_id: str, debit: float, credit: float, currency="USD"):
        self.account_id = account_id
        self.debit = debit
        self.credit = credit
        self.currency = currency
        self.timestamp = datetime.utcnow()

class Transaction:
    def __init__(self, tx_id: str, entries: List[LedgerEntry]):
        self.tx_id = tx_id
        self.entries = entries
        self.validate_balance()
        self.hash = self.generate_hash()

    def validate_balance(self):
        total_debit = sum(e.debit for e in self.entries)
        total_credit = sum(e.credit for e in self.entries)
        if abs(total_debit - total_credit) > 1e-4:
            raise ValueError(f"Unbalanced Transaction: Debit {total_debit} != Credit {total_credit}")

    def generate_hash(self) -> str:
        payload = f"{self.tx_id}:" + ",".join(f"{e.account_id}:{e.debit}:{e.credit}" for e in self.entries)
        return hashlib.sha256(payload.encode()).hexdigest()
`,
      },
      {
        name: 'risk_scorer.py',
        path: 'vaultpulse/models/risk_scorer.py',
        size: 2600,
        type: 'text/x-python',
        content: `"""Anomaly detection and rapid volatility scoring for wire transfers."""
import numpy as np

class RiskModel:
    def __init__(self, historical_mean=50000.0, historical_std=12000.0):
        self.mean = historical_mean
        self.std = historical_std

    def compute_z_score(self, amount: float) -> float:
        return (amount - self.mean) / (self.std + 1e-9)

    def evaluate_risk(self, amount: float, destination_country: str) -> Dict[str, any]:
        z = self.compute_z_score(amount)
        flag = z > 3.0 or destination_country in ["HIGH_RISK_JURISDICTION"]
        return {
            "amount": amount,
            "z_score": round(float(z), 3),
            "flagged": bool(flag),
            "recommendation": "Manual Audit Required" if flag else "Approved Automated Route"
        }
`,
      },
      {
        name: 'AUDIT_SPEC.md',
        path: 'vaultpulse/AUDIT_SPEC.md',
        size: 1980,
        type: 'text/markdown',
        content: `# VaultPulse Ledger Specification & Security Proofs

### Purpose
Implements regulatory SOX compliance requirements for automated ledger balancing.

### Core Guarantees
1. Zero unbalanced journal entries accepted into persistent storage.
2. SHA-256 block hash chaining prevents retroactive tampering.
3. Automated unit tests verify tolerance limits under heavy multi-threaded transactions.
`,
      },
    ],
  },
  {
    id: 'pkg-brand-design-system',
    name: 'Nexus UI Design System & Component Library',
    clientName: 'Hyperion Interactive',
    category: 'UI/UX & Frontend Components',
    description: 'Gamer-inspired modular design tokens, accessibility-tested component bundle, and style guide.',
    files: [
      {
        name: 'tokens.json',
        path: 'nexus-ui/tokens/design-tokens.json',
        size: 1650,
        type: 'application/json',
        content: JSON.stringify(
          {
            color: {
              brand: {
                primary: '#06B6D4',
                secondary: '#8B5CF6',
                accent: '#10B981',
              },
              surface: {
                base: '#020617',
                card: '#0F172A',
                border: '#1E293B',
              },
            },
            typography: {
              fontFamily: 'Outfit, sans-serif',
              mono: 'JetBrains Mono, monospace',
            },
            radius: {
              sm: '4px',
              md: '8px',
              lg: '12px',
            },
          },
          null,
          2
        ),
      },
      {
        name: 'HudButton.tsx',
        path: 'nexus-ui/components/HudButton.tsx',
        size: 2100,
        type: 'text/typescript',
        content: `import React from 'react';

interface HudButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  glow?: boolean;
}

export const HudButton: React.FC<HudButtonProps> = ({
  children,
  variant = 'primary',
  glow = false,
  className = '',
  ...props
}) => {
  const base = "relative px-5 py-2.5 font-medium rounded-lg transition-all duration-200 uppercase tracking-wider text-xs font-mono";
  const styles = {
    primary: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400",
    secondary: "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
  };

  return (
    <button className={\`\${base} \${styles[variant]} \${glow ? 'shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''} \${className}\`} {...props}>
      {children}
    </button>
  );
};`,
      },
      {
        name: 'STYLEGUIDE.md',
        path: 'nexus-ui/STYLEGUIDE.md',
        size: 1540,
        type: 'text/markdown',
        content: `# Nexus UI Component Style Guide

### Philosophy
Minimalist, high-performance tactical interface system inspired by military HUDs and modern esports cockpits.

### Accessibility Standards
- Minimum contrast ratio of 4.5:1 against #020617 background.
- Focus rings styled with cyan-400 2px offset.
- All interactive controls feature keyboard navigation and aria labels.
`,
      },
    ],
  },
];
