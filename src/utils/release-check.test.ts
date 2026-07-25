import { spawnSync } from 'node:child_process';
import path from 'node:path';

function runReleaseCheck(iconUrl?: string) {
  return spawnSync(process.execPath, ['scripts/release-check.cjs'], {
    cwd: path.resolve(__dirname, '../..'),
    encoding: 'utf8',
    env: { ...process.env, AIT_ICON_URL: iconUrl ?? '' },
  });
}

describe('release check', () => {
  it('콘솔 아이콘 URL이 없으면 출시 빌드를 차단한다', () => {
    const result = runReleaseCheck();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('AIT_ICON_URL 환경 변수');
  });

  it('HTTPS 아이콘 URL과 로컬 600×600 아이콘을 검증한다', () => {
    const result = runReleaseCheck('https://static.example.com/app-icon.png');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('출시 필수 설정 검사를 통과했어요.');
  });
});
