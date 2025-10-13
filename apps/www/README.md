# apps/frontend

### 간단 소개

- 15 버전을 사용하며 앱 라우터를 사용합니다.
- Styled Component를 사용하며, Mantine v7을 사용합니다.
- 전역 상태 라이브러리는 따로 사용하지 않고, React의 Context API를 사용합니다.
- 데이터 조회는 Server Component에서 수행하고, Mutation은 Server Action을 사용합니다.  
  클라이언트에서 직접 조회하는 경우 SWR을 사용합니다.
