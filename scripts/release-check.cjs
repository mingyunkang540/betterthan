const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'granite.config.ts');
const testerConfigPath = path.join(
  root,
  'src',
  'constants',
  'tester-config.ts',
);
const iconPath = path.join(root, 'assets', 'brand', 'app-icon-600-v1.png');
const consoleIconUrl =
  'https://static.toss.im/appsintoss/60223/fbecb575-1537-4486-968e-e81aae24cc02.png';
const failures = [];

function pngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== pngSignature) return undefined;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const config = fs.readFileSync(configPath, 'utf8');
const testerConfig = fs.readFileSync(testerConfigPath, 'utf8');
if (!config.includes("appName: 'betterthan'"))
  failures.push('granite.config.ts의 appName이 betterthan이 아니에요.');
if (!config.includes("displayName: '어제보다'"))
  failures.push('granite.config.ts의 표시 이름이 어제보다가 아니에요.');
if (!config.includes("permissions: []"))
  failures.push('1차 출시 권한 목록이 비어 있지 않아요.');
if (!testerConfig.includes('export const TESTER_REWARD_GRANT = 0;'))
  failures.push('공개 출시 빌드에 테스터용 기록 조각이 남아 있어요.');
if (!config.includes(`'${consoleIconUrl}'`))
  failures.push('brand.icon이 콘솔에 등록한 아이콘 URL과 다릅니다.');
const sourceRoot = path.join(root, 'src');
const sourceFiles = fs
  .readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name));
for (const entry of sourceFiles) {
  const sourcePath = path.join(entry.parentPath, entry.name);
  if (fs.readFileSync(sourcePath, 'utf8').includes('ait-ad-test-')) {
    failures.push('출시 번들에 테스트용 광고 그룹 ID가 남아 있어요.');
    break;
  }
}

if (!fs.existsSync(iconPath)) {
  failures.push('600×600 앱 아이콘 파일이 없어요.');
} else {
  const dimensions = pngDimensions(iconPath);
  if (!dimensions || dimensions.width !== 600 || dimensions.height !== 600)
    failures.push('앱 아이콘은 600×600 PNG여야 해요.');
}

if (failures.length > 0) {
  console.error('출시 전 검사를 통과하지 못했어요.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('출시 필수 설정 검사를 통과했어요.');
  console.log('- appName: betterthan');
  console.log('- displayName: 어제보다');
  console.log('- icon: 콘솔 등록 URL과 일치');
  console.log('- permissions: 없음');
  console.log('- ads: 사용하지 않음');
  console.log('- initial tester grant: 0조각');
}
