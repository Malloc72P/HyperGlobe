# HyperGlobe CLI

GeoJSON 파일을 HyperGlobe 맵 포맷(.hgm)으로 변환하는 커맨드라인 도구입니다.

## 개요

HyperGlobe CLI는 WGS84 좌표계를 사용하는 GeoJSON 파일을 HyperGlobe에서 사용할 수 있는 최적화된 바이너리 포맷(.hgm)으로 변환합니다.

## 주요 기능

- **GeoJSON → HGM 변환**: 표준 GeoJSON 파일을 HyperGlobe 전용 포맷으로 변환
- **자동 삼각분할**: Delaunay 알고리즘을 사용한 폴리곤 삼각분할
- **데이터 압축**: gzip 압축으로 파일 크기 최소화
- **외곽선 추출**: 지역 경계선 자동 추출
- **메타데이터 보존**: GeoJSON 속성 정보 유지

## 설치

### 개발 환경에서

프로젝트 루트에서:

```bash
pnpm install
pnpm build
```

### 실행 방법

```bash
# 빌드 후 직접 실행
node ./packages/hyperglobe-cli/dist/index.js -i <입력파일> -o <출력파일>

# 또는 tsx로 실행 (개발 중)
cd packages/hyperglobe-cli
pnpm hg -i <입력파일> -o <출력파일>
```

## 사용법

### 기본 구조

```bash
hyperglobe -i <입력파일> [-o <출력파일>]
```

### 옵션

#### `-i, --input <file>` (필수)

입력 GeoJSON 파일 경로를 지정합니다.

- 상대 경로 또는 절대 경로 사용 가능
- 확장자: `.json` 또는 `.geo.json`
- WGS84 좌표계 사용 권장

**예시:**
```bash
hyperglobe -i ./data/world.geo.json
hyperglobe -i /absolute/path/to/map.json
```

#### `-o, --output <file>` (선택)

출력 HGM 파일 경로를 지정합니다.

- 생략 시 현재 디렉토리에 생성
- 확장자: `.hgm`
- 디렉토리 자동 생성

**예시:**
```bash
hyperglobe -i input.geo.json -o output.hgm
hyperglobe -i input.geo.json -o ./maps/world.hgm
```

## 사용 예시

### 기본 변환

```bash
# 현재 디렉토리의 world.geo.json을 변환
hyperglobe -i world.geo.json -o world.hgm
```

### 다른 디렉토리의 파일 변환

```bash
# 상대 경로
hyperglobe -i ./data/countries.geo.json -o ./public/maps/countries.hgm

# 절대 경로
hyperglobe -i /Users/name/data/map.geo.json -o /Users/name/dist/map.hgm
```

### 해상도별 맵 생성

```bash
# 저해상도
hyperglobe -i world-low.geo.json -o nations-low.hgm

# 중해상도
hyperglobe -i world-mid.geo.json -o nations-mid.hgm

# 고해상도
hyperglobe -i world-high.geo.json -o nations-high.hgm
```

## 변환 과정

CLI는 다음 단계를 거쳐 GeoJSON을 HGM으로 변환합니다:

### 1. GeoJSON 로드
- 파일 읽기 및 JSON 파싱
- 좌표계 검증 (WGS84 권장)

### 2. 피쳐 단순화
- GeoJSON 피쳐를 내부 포맷으로 변환
- 불필요한 속성 제거

### 3. 삼각분할
- Delaunay 알고리즘으로 폴리곤 삼각분할
- 각 폴리곤을 삼각형 메시로 변환
- vertices(정점)와 indices(인덱스) 생성

### 4. 외곽선 추출
- 각 폴리곤의 경계선 추출
- 3D 좌표로 변환

### 5. HGM 포맷 생성
- 삼각분할 결과와 외곽선을 HGM 구조로 패키징
- 메타데이터 포함

### 6. 압축 및 저장
- gzip으로 데이터 압축
- 파일로 저장

## HGM 포맷 구조

변환된 HGM 파일은 다음 구조를 가집니다:

```typescript
interface HGMFile {
  features: HGMFeature[];  // 지역 피쳐 배열
  metadata?: any;          // 메타데이터 (선택)
}

interface HGMFeature {
  id: string;              // 지역 ID
  properties: any;         // GeoJSON 속성
  geometries: Array<{
    vertices: number[];    // 삼각분할된 정점 [x,y,z,x,y,z,...]
    indices: number[];     // 삼각형 인덱스
  }>;
  borderLines: {
    pointArrays: number[][]; // 외곽선 좌표
  };
}
```

## GeoJSON 요구사항

### 지원하는 Geometry 타입

- `Polygon`: 단일 폴리곤
- `MultiPolygon`: 멀티 폴리곤

### 필수 속성

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      },
      "properties": {
        "id": "KOR",  // 필수: 고유 ID
        "name": "대한민국"  // 권장: 이름
      }
    }
  ]
}
```

### 좌표계

- **WGS84** (EPSG:4326) 사용 권장
- 경도(Longitude): -180 ~ 180
- 위도(Latitude): -90 ~ 90

## 성능

### 변환 속도

파일 크기와 피쳐 수에 따라 달라집니다:

- **저해상도** (50개 국가): ~1초
- **중해상도** (200개 국가): ~5초
- **고해상도** (1000개 지역): ~30초

### 파일 크기 감소

gzip 압축으로 파일 크기가 크게 감소합니다:

- **GeoJSON**: 10MB → **HGM**: 2-3MB (약 70% 감소)

## 트러블슈팅

### 오류: "Invalid GeoJSON format"

**원인:** GeoJSON 파일이 표준 형식을 따르지 않음

**해결:**
- GeoJSON 검증 도구로 파일 확인
- `type: "FeatureCollection"` 있는지 확인
- `features` 배열 존재 확인

### 오류: "No such file or directory"

**원인:** 입력 파일 경로가 잘못됨

**해결:**
- 파일 경로 확인
- 상대 경로 대신 절대 경로 사용
- 파일 존재 여부 확인

### 변환이 느림

**원인:** 고해상도 지도는 삼각분할에 시간이 오래 걸림

**해결:**
- 해상도 낮추기
- 불필요한 세부 사항 제거
- 단순화 도구 사용 (예: mapshaper)

### 메모리 부족 오류

**원인:** 매우 큰 GeoJSON 파일 처리 시 메모리 부족

**해결:**
- Node.js 메모리 제한 늘리기: `node --max-old-space-size=4096`
- 지도를 여러 파일로 분할

## 관련 패키지

- `@hyperglobe/core`: HyperGlobe 메인 라이브러리
- `@hyperglobe/node-tools`: Node.js 환경용 도구 (CLI 내부 사용)
- `@hyperglobe/tools`: 공통 유틸리티

## 개발

### 테스트

```bash
cd packages/hyperglobe-cli
pnpm test
```

### 개발 모드 실행

```bash
cd packages/hyperglobe-cli
pnpm hg -- -i ./dummy/world-low.geo.json -o ./dummy/world-low.hgm
```

## 라이선스

이 프로젝트는 HyperGlobe 프로젝트의 일부입니다.

## 참고 문서

- [HyperGlobe 컴포넌트](../../docs/hyperglobe/hyperglobe-component.md)
- [RegionFeature 컴포넌트](../../docs/hyperglobe/region-feature.md)
- [수학 라이브러리](../../docs/hyperglobe/math-libraries.md)
