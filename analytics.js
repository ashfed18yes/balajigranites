// Vercel Analytics — initializes page view tracking for all pages
import { inject } from '@vercel/analytics';

// Vercel Speed Insights — collects Core Web Vitals & performance metrics
import { injectSpeedInsights } from '@vercel/speed-insights';

inject();
injectSpeedInsights();
