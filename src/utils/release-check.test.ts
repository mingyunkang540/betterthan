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

  it('테스트용 광고 그룹 ID가 있으면 출시 빌드를 차단한다', () => {
    const result = runReleaseCheck();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('테스트용 광고 그룹 ID');
  });
});
