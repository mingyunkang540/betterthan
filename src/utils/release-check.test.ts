import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function runReleaseCheck() {
  return spawnSync(process.execPath, ['scripts/release-check.cjs'], {
    cwd: path.resolve(__dirname, '../..'),
    encoding: 'utf8',
  });
}

describe('release check', () => {
  it('granite 설정에 콘솔 브랜드 아이콘 URL을 고정한다', () => {
    const config = readFileSync(
      path.resolve(__dirname, '../../granite.config.ts'),
      'utf8',
    );

    expect(config).toContain(
      'https://static.toss.im/appsintoss/60223/fbecb575-1537-4486-968e-e81aae24cc02.png',
    );
  });

  it('광고 없이 출시 필수 설정 검사를 통과한다', () => {
    const result = runReleaseCheck();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('ads: 사용하지 않음');
  });
});
