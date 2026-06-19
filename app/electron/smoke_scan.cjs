#!/usr/bin/env node
require('./env.cjs').load();
const { runScan, applyFix } = require('./scanner.cjs');

async function main() {
  const repoPath = process.argv[2];
  if (!repoPath) {
    console.error('usage: node app/electron/smoke_scan.cjs /absolute/path/to/repo [--apply]');
    process.exit(2);
  }
  const messages = [];
  const thinking = [];
  const result = await runScan({
    repoPath,
    emit: (message) => messages.push(message),
    think: (entry) => {
      thinking.push(entry);
      console.log(`[${entry.agent}] ${entry.text}`);
    },
  });

  const approved = (result.proposedFixes || []).filter((fix) => fix.approved !== false);
  console.log(
    JSON.stringify(
      {
        repoPath,
        messages: messages.length,
        findings: result.findings.length,
        proposedFixes: result.proposedFixes?.length || 0,
        approvedFixes: approved.length,
        report: result.report?.path || null,
      },
      null,
      2,
    ),
  );

  if (process.argv.includes('--apply')) {
    for (const fix of approved) {
      const applied = applyFix(fix, repoPath);
      console.log(`applied ${applied.file} backup=${applied.backup}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
