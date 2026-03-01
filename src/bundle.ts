import * as fs from 'fs';
import * as path from 'path';

/**
 * Bundle Size — Track and enforce file size budgets
 */
export class BundleSize {
    /** Measure directory size */
    static measure(dirPath: string): Array<{ file: string; size: number; formatted: string }> {
        const files = this.walkDir(dirPath);
        return files.map((f) => {
            const size = fs.statSync(f).size;
            return { file: path.relative(dirPath, f), size, formatted: this.formatSize(size) };
        }).sort((a, b) => b.size - a.size);
    }

    /** Get total size */
    static totalSize(dirPath: string): { bytes: number; formatted: string } {
        const files = this.measure(dirPath);
        const bytes = files.reduce((sum, f) => sum + f.size, 0);
        return { bytes, formatted: this.formatSize(bytes) };
    }

    /** Check budget */
    static checkBudget(dirPath: string, maxBytes: number): { passed: boolean; actual: number; budget: number; overBy: number } {
        const { bytes } = this.totalSize(dirPath);
        return { passed: bytes <= maxBytes, actual: bytes, budget: maxBytes, overBy: Math.max(0, bytes - maxBytes) };
    }

    /** Compare two directories */
    static compare(oldDir: string, newDir: string): { oldSize: number; newSize: number; diff: number; percentChange: string } {
        const oldTotal = this.totalSize(oldDir).bytes;
        const newTotal = this.totalSize(newDir).bytes;
        const diff = newTotal - oldTotal;
        const pct = oldTotal > 0 ? ((diff / oldTotal) * 100).toFixed(1) : '0';
        return { oldSize: oldTotal, newSize: newTotal, diff, percentChange: `${diff >= 0 ? '+' : ''}${pct}%` };
    }

    /** Generate markdown report */
    static report(dirPath: string, budget?: number): string {
        const files = this.measure(dirPath);
        const total = this.totalSize(dirPath);
        let md = `# Bundle Size Report\n\n**Total:** ${total.formatted}\n`;
        if (budget) { const check = this.checkBudget(dirPath, budget); md += `**Budget:** ${this.formatSize(budget)} — ${check.passed ? '✅ PASS' : '❌ OVER by ' + this.formatSize(check.overBy)}\n`; }
        md += `\n| File | Size |\n|------|------|\n`;
        files.forEach((f) => { md += `| ${f.file} | ${f.formatted} |\n`; });
        return md;
    }

    private static walkDir(dir: string): string[] {
        const results: string[] = [];
        fs.readdirSync(dir).forEach((f) => {
            const full = path.join(dir, f);
            if (fs.statSync(full).isDirectory()) results.push(...this.walkDir(full));
            else results.push(full);
        });
        return results;
    }

    private static formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0; let s = bytes;
        while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
        return `${s.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
    }
}
