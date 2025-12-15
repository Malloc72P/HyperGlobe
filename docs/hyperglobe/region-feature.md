# RegionFeature 컴포넌트 (삭제됨)

> ⚠️ **이 컴포넌트는 삭제되었습니다.**

## 삭제 사유

`RegionFeature`는 개별 국가마다 별도의 메시와 드로우콜을 발생시켜 심각한 성능 문제가 있었습니다.

### 성능 문제

| 항목 | 수치 |
|------|------|
| 200개 국가 렌더링 시 드로우콜 | 약 600회 |
| 2개 HyperGlobe 인스턴스 사용 시 FPS | 75 → 40 저하 |

### 원인

- 각 국가마다 상단면, 측면, 외곽선 3개의 드로우콜 발생
- N개 국가 × 3 = 3N 드로우콜
- GPU 병목 현상으로 프레임 드랍

## 대체 컴포넌트

**[RegionFeatureCollection](./region-feature-collection.md)** 을 사용하세요.

### 개선 사항

| 항목 | RegionFeature | RegionFeatureCollection |
|------|---------------|------------------------|
| 드로우콜 (200개 국가) | ~600 | ~6 |
| 국가별 색상 | ✅ 개별 메시 | ✅ Vertex Color |
| ColorScale 지원 | ✅ | ✅ |
| 호버 지원 | ✅ | ✅ (오버레이 방식) |

```tsx
// ❌ 삭제된 방식
{features.map(feature => (
  <RegionFeature key={feature.id} feature={feature} />
))}

// ✅ 새로운 방식
<RegionFeatureCollection features={features} />
```

### 아래는 레거시 문서입니다.

---

# RegionFeature 컴포넌트

## 개요

`RegionFeature`는 GeoJSON 형식의 지역 데이터를 3D 지구본에 렌더링하는 컴포넌트입니다. 폴리곤과 멀티폴리곤을 지원하며, 삼각분할을 통해 최적화된 3D 메시로 변환합니다.

## 주요 기능

### 지오메트리 처리
- **GeoJSON 지원**: HGM(HyperGlobe Map) 포맷의 피쳐 데이터 처리
- **삼각분할**: Delaunay 알고리즘을 사용한 폴리곤 삼각분할
- **지오메트리 병합**: 여러 폴리곤을 하나의 지오메트리로 병합하여 드로우콜 최소화
- **외곽선 렌더링**: 지역 경계선 표시

### 스타일링
- 기본 스타일 (색상, 투명도)
- 호버 스타일
- 컬러스케일 지원 (데이터 시각화)
- 와이어프레임 모드

### 입체감 표현
- **측면(Extrusion) 렌더링**: 폴리곤의 측면을 렌더링하여 입체감 추가
- z-fighting 방지: 폴리곤을 구 표면에서 약간 띄워 렌더링

## Props

### 필수
- `feature`: HGMFeature 객체 (지역의 지오메트리 정보)

### 선택
- `style`: 기본 스타일
- `hoverStyle`: 호버 시 적용될 스타일
- `colorscale`: 데이터 시각화를 위한 컬러스케일
- `data`: 피쳐에 연결된 추가 데이터
- `wireframe`: 와이어프레임 모드
- `extrusion`: 측면 렌더링 옵션 (기본값: `{ color: Colors.GRAY[8] }` - 기본 활성화)

## 사용 예시

### 기본 사용
```tsx
import { HyperGlobe, RegionFeature } from 'hyperglobe';

function Map() {
  return (
    <HyperGlobe>
      <RegionFeature 
        feature={koreaFeature}
        style={{
          fillColor: '#3b82f6',
          opacity: 0.8
        }}
      />
    </HyperGlobe>
  );
}
```

### 컬러스케일과 함께 사용
```tsx
import { HyperGlobe, RegionFeature, useColorScale } from 'hyperglobe';

function DataVisualization() {
  const colorscale = useColorScale({
    steps: [
      { from: 0, to: 100, style: { fillColor: '#eff6ff' } },
      { from: 100, to: 500, style: { fillColor: '#3b82f6' } },
      { from: 500, to: Infinity, style: { fillColor: '#1e40af' } }
    ],
    data: gdpData
  });

  return (
    <HyperGlobe>
      {features.map(feature => (
        <RegionFeature
          key={feature.id}
          feature={feature}
          colorscale={colorscale}
        />
      ))}
    </HyperGlobe>
  );
}
```

### 측면 렌더링
```tsx
<RegionFeature
  feature={feature}
  style={{ fillColor: '#3b82f6' }}
  extrusion={{
    color: '#1e3a8a'
  }}
/>
```

## 기술 세부사항

### 렌더링 파이프라인

1. **피쳐 데이터 로드**
   - HGM 포맷의 피쳐 데이터 사용 (HyperGlobe CLI 도구로 사전 변환됨)
   - `useRegionModel` 훅으로 RegionModel 생성 (R-Tree 공간 인덱싱 및 호버 감지용)

2. **삼각분할 (CLI 전처리 단계)**
   - 삼각분할은 **CLI 변환 시 이미 완료**되어 HGM 파일에 저장됨
   - `delaunayTriangulate` 함수 사용 (Delaunator 라이브러리 기반)
   - 결과: vertices(정점 배열)와 indices(인덱스 배열)
   - 컴포넌트는 전처리된 데이터를 그대로 사용.

3. **지오메트리 생성**
   ```typescript
   const geometry = new THREE.BufferGeometry();
   geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
   geometry.setIndex(Array.from(indices));
   geometry.computeVertexNormals();
   ```

4. **지오메트리 병합**
   - `mergeGeometries` 함수로 모든 폴리곤 병합
   - 드로우콜을 1회로 줄여 성능 최적화

5. **외곽선 생성**
   - `borderLines.pointArrays`에서 외곽선 좌표 추출
   - `Line` 컴포넌트로 렌더링

6. **측면 생성 (선택적)**
   - `createSideGeometry` 함수 사용
   - 외곽선 각 선분마다 사각형(2개 삼각형) 생성
   - 상단: 폴리곤 높이, 하단: 구 표면

### 성능 최적화

**지오메트리 병합**
- 여러 폴리곤을 하나의 BufferGeometry로 병합
- 드로우콜 최소화 → 렌더링 성능 향상

**메모이제이션**
- `useMemo`를 사용하여 불필요한 재계산 방지
- 피쳐 데이터가 변경될 때만 재생성

**버퍼 지오메트리**
- Three.js의 BufferGeometry 사용
- GPU 메모리에 직접 데이터 전송

### 사용된 수학 라이브러리

#### @hyperglobe/tools
- `delaunayTriangulate`: 폴리곤 삼각분할 (CLI 전처리 단계에서 사용)
- `CoordinateConverter`: 경위도 ↔ 3D 좌표 변환

#### Three.js
- `BufferGeometry`: 최적화된 지오메트리 표현
- `mergeGeometries`: 지오메트리 병합
- `Float32BufferAttribute`: 정점 데이터 저장
- `computeVertexNormals`: 법선 벡터 자동 계산

#### 내부 라이브러리
- `createSideGeometry`: 측면 지오메트리 생성

자세한 내용은 [수학 라이브러리 문서](./math-libraries.md)를 참조하세요.

## 데이터 형식

### HGMFeature
```typescript
interface HGMFeature {
  id: string;
  // 속성 정보 (국가명, ISO 코드 등)
  properties: Record<string, any>;
  // 지오메트리 생성을 위한 정보 (삼각분할 결과)
  geometries: Array<{
    vertices: Float32Array;  // [x, y, z, x, y, z, ...]
    indices: Uint32Array;    // 삼각형 인덱스
  }>;
  // 외곽선 정보
  borderLines: {
    pointArrays: Float32Array[];  // 외곽선 좌표
  };
  // 바운딩 박스
  bbox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}
```

## 제약사항

- 폴리곤과 멀티폴리곤만 지원 (LineString, Point 등은 별도 컴포넌트 사용)
- HGM 포맷으로 전처리된 데이터 필요 (CLI 도구로 변환)

## 관련 문서
- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [ColorScale 시스템](./colorscale.md)
- [수학 라이브러리](./math-libraries.md)
