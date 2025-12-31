import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [
    // 모노레포의 다른 패키지를 vite가 제대로 처리하도록 설정(해당 모듈은 ts코드를 그대로 export하므로, vite가 빌드 시점에 변환 필요)
    tsconfigPaths(),
    // React 지원
    react(),
    // 타입 선언 파일(.d.ts) 생성
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.app.json',
      exclude: ['**/*.spec.*', 'example/**/*', '**/*.stories.tsx', 'storybook/**/*'],
    }),
  ],
  build: {
    lib: {
      // 엔트리는 src/index.ts이다. 여기서 내보낸 모든 것들이 패키지의 공개 API가 된다.
      entry: resolve(__dirname, 'src/index.ts'),
      // 패키지 이름
      name: 'HyperGlobe',
      // 출력 파일 이름 설정
      fileName: (format) => `hyperglobe.${format}.js`,
      cssFileName: 'hyperglobe',
      // 지원하는 모듈 형식.
      formats: ['es'],
    },
    rollupOptions: {
      // 외부화 처리할 모듈들 (번들에 포함하지 않음)
      external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
    },
  },
});
