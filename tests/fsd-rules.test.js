import { ESLint } from 'eslint';

const eslint = new ESLint({ overrideConfigFile: './eslint.config.mjs' });

async function runTests() {
  const results = await eslint.lintFiles(['tests/test-files/']);

  results.forEach((result) => {
    console.log(`\n${result.filePath}`);
    result.messages.forEach((msg) => {
      console.log(`❌ ${msg.ruleId}: ${msg.message} (line ${msg.line})`);
    });
  });

  console.log('\n✅ 모든 테스트가 완료되었습니다.');
}

runTests();