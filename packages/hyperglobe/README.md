# HyperGlobe/Core

## 프로젝트 구성

- Vite, React, ThreeJs 사용

### Vite 구성

#### tsconfig.json

- Project Reference를 사용하여 여러 tsconfig를 관리하는 최상위 설정

#### tsconfig.app.json

- 브라우저에서 실행될 코드를 위한 설정
- JSX, DOM API 사용 가능
- React 관련 타입 사용
- 개발 서버 및 라이브러리 빌드에 사용

#### tsconfig.node.json

- 빌드 관련 도구를 위해 필요한 설정  
    ```
    "include": ["vite.config.ts"]
    ```

### 폴더 소개

#### src

- HyperGlobe 프로덕션 코드

#### pages

- 문서사이트를 위한 mdx문서를 모아놓은 폴더

#### public

- 에셋. 텍스쳐 및 문서사이트를 위한 이미지를 포함함.
- 주의, 지도 데이터는 CDN(unpkg)에서 가져오도록 구성해야함