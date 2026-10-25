// 015:T011 Verify all three statements offline from their bundles, with the arguments visitors get (015:FR-005, 015:FR-007)
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { statements, verifyArgs, type Statement } from '../src/site/provenance.ts';

export function verifyPlan(dir: string): { statement: Statement['id']; args: string[] }[] {
  return statements.map((s) => ({
    statement: s.id,
    args: verifyArgs({
      file: `${dir}/${s.subject}`,
      bundle: `${dir}/${s.bundle}`,
      predicateType: s.predicateType,
    }),
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, dir] = process.argv.slice(2);
  if (command !== 'verify' || !dir) {
    console.error('Usage: node scripts/provenance.ts verify <dir>');
    process.exit(1);
  }
  for (const { statement, args } of verifyPlan(dir)) {
    try {
      execFileSync('gh', [...args, '--format', 'json'], { stdio: ['ignore', 'ignore', 'pipe'] });
      console.log(`✅ ${statement}: verified`);
    } catch (error) {
      const stderr = String((error as { stderr?: Buffer }).stderr ?? error).trim();
      console.error(`❌ ${statement}: not verified\n${stderr}`);
      process.exit(1);
    }
  }
}
