import { NextResponse } from 'next/server';
import { initialResources } from '@/lib/cloudData';
import { globalCostOptimizer } from '@/lib/costOptimizer';

export async function GET() {
  const insights = globalCostOptimizer.generateInsights(initialResources);
  const totalSavings = globalCostOptimizer.getTotalMonthlySavings(insights);
  const totalSpend = initialResources.reduce((s, r) => s + r.monthlyCost, 0);

  return NextResponse.json({
    totalSpend: Math.round(totalSpend * 100) / 100,
    potentialMonthlySavings: totalSavings,
    savingsPercentage: Math.round((totalSavings / (totalSpend || 1)) * 1000) / 10,
    insights,
    byCategory: {
      compute: 396.28,
      storage: 702.40,
      database: 423.36,
      serverless: 32.40,
      networking: 184.20,
    },
  });
}
