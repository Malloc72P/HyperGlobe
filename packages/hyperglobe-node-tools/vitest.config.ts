import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 테스트 실행 환경 (node, jsdom, happy-dom 등)
    environment: 'node',

    // 테스트 파일 패턴
    include: ['src/**/*.spec.{ts,tsx}'],
  },
});
