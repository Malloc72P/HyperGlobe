import { defineConfig } from 'vite';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // 모노레포의 다른 패키지를 vite가 제대로 처리하도록 설정(해당 모듈은 ts코드를 그대로 export하므로, vite가 빌드 시점에 변환 필요)
    tsconfigPaths(),
  ],
  build: {
    lib: {
      // 엔트리는 src/index.ts이다. 여기서 내보낸 모든 것들이 패키지의 공개 API가 된다.
      entry: resolve(__dirname, 'src/index.ts'),
      // 패키지 이름
      name: 'HyperGlobe',
      // 출력 파일 이름 설정
      fileName: (format) => `hyperglobe.${format}.js`,
      // 지원하는 모듈 형식. 근데 umd는 뺴도 될 듯 하다.
      formats: ['es'],
    },
    target: 'node18',
    ssr: true,
  },
});
