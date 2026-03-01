# webext-bundle-size — Bundle Size Tracking
> **Built by [Zovo](https://zovo.one)** | `npm i webext-bundle-size`

Measure directory sizes, enforce budgets, compare versions, and generate markdown reports.

```typescript
import { BundleSize } from 'webext-bundle-size';
const files = BundleSize.measure('./dist');
const check = BundleSize.checkBudget('./dist', 500 * 1024);
const report = BundleSize.report('./dist', 500 * 1024);
```
MIT License
