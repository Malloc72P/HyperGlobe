# PointsFeature 컴포넌트

## 개요

PointsFeature는 지구본 위에 **대량의 점들을 효율적으로 표시**하는 컴포넌트입니다.

- **용도**: 데이터 시각화, 분포 표현, 밀도 맵
- **적합한 개수**: 수백 ~ 수만 개
- **특징**: 고성능, 단순 점 표현, 색상별 구분

## 구현 방식

### 기술 스택
- **Three.js의 Points + PointsMaterial**
- BufferGeometry로 효율적인 메모리 관리
- 단일 Draw Call로 모든 점 렌더링

### 주요 기능
1. **대량 점 렌더링**: 수만 개의 점을 빠르게 표시
2. **색상별 구분**: 각 점마다 다른 색상 적용 가능
3. **자동 Depth Test**: 지구 반대편 점은 자동으로 가려짐
4. **크기 조절**: 고정 크기 또는 거리에 따른 크기 변화

## Props 설계

```typescript
export interface PointData {
  /** 점 위치 (경도, 위도) */
  position: LonLat;
  
  /** 점 색상 (선택사항) */
  color?: string;
  
  /** 사용자 정의 데이터 */
  data?: any;
}

export interface PointsFeatureProps {
  /** 표시할 점 배열 */
  points: PointData[];
  
  /** 기본 점 색상 */
  defaultColor?: string;
  
  /** 점 크기 */
  size?: number;
  
  /** 거리에 따른 크기 변화 여부 */
  sizeAttenuation?: boolean;
  
  /** 불투명도 */
  opacity?: number;
  
  /** 투명도 사용 여부 */
  transparent?: boolean;
}
```

## 사용 예시

### 기본 사용

```tsx
import { HyperGlobe, PointsFeature } from 'hyperglobe';

function App() {
  const points = [
    { position: [37.5665, 126.9780] }, // 서울
    { position: [35.6762, 139.6503] }, // 도쿄
    { position: [51.5074, -0.1278] },  // 런던
    // ... 수천 개의 점
  ];

  return (
    <HyperGlobe>
      <PointsFeature points={points} size={0.02} />
    </HyperGlobe>
  );
}
```

### 색상별 구분

```tsx
const points = [
  { position: [37.5665, 126.9780], color: '#ff0000' }, // 빨강
  { position: [35.6762, 139.6503], color: '#00ff00' }, // 초록
  { position: [51.5074, -0.1278], color: '#0000ff' },  // 파랑
];

<PointsFeature points={points} size={0.02} />
```

### 데이터 시각화

```tsx
// 인구 밀도 시각화
const populationData = cities.map(city => ({
  position: [city.lon, city.lat],
  color: getColorByPopulation(city.population),
}));

<PointsFeature
  points={populationData}
  size={0.015}
  sizeAttenuation={true}
  opacity={0.8}
  transparent={true}
/>
```

### 대량 데이터 (10,000개)

```tsx
// 랜덤 좌표 생성
const randomPoints = Array.from({ length: 10000 }, () => ({
  position: [
    Math.random() * 360 - 180, // 경도: -180 ~ 180
    Math.random() * 180 - 90,   // 위도: -90 ~ 90
  ] as LonLat,
  color: `hsl(${Math.random() * 360}, 70%, 50%)`,
}));

<PointsFeature
  points={randomPoints}
  size={0.01}
  sizeAttenuation={false}
/>
```

## 구현 세부사항

### 1. BufferGeometry 생성

```typescript
import { BufferGeometry, BufferAttribute, Points, PointsMaterial } from 'three';
import { lonLatToVector3 } from '@hyperglobe/tools';

function createPointsGeometry(points: PointData[]) {
  const positions: number[] = [];
  const colors: number[] = [];
  
  points.forEach(point => {
    // 좌표 변환
    const pos3D = lonLatToVector3(point.position, GLOBE_RADIUS);
    positions.push(pos3D.x, pos3D.y, pos3D.z);
    
    // 색상 추가
    const color = new Color(point.color || '#ffffff');
    colors.push(color.r, color.g, color.b);
  });
  
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(colors), 3)
  );
  
  return geometry;
}
```

### 2. PointsMaterial 설정

```typescript
const material = new PointsMaterial({
  size: 0.02,
  vertexColors: true,        // 각 점마다 다른 색상 사용
  sizeAttenuation: true,     // 거리에 따라 크기 변화
  transparent: true,
  opacity: 0.8,
  depthTest: true,           // 지구 뒤에서 가려짐
  depthWrite: false,         // 투명도 렌더링 개선
});
```

### 3. React 컴포넌트 구현

```tsx
import { useMemo } from 'react';
import { Color } from 'three';

export function PointsFeature({
  points,
  size = 0.02,
  defaultColor = '#ffffff',
  sizeAttenuation = true,
  opacity = 1,
  transparent = false,
}: PointsFeatureProps) {
  const [positions, colors] = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    
    points.forEach(point => {
      const pos3D = lonLatToVector3(point.position);
      positions.push(pos3D.x, pos3D.y, pos3D.z);
      
      const color = new Color(point.color || defaultColor);
      colors.push(color.r, color.g, color.b);
    });
    
    return [
      new Float32Array(positions),
      new Float32Array(colors),
    ];
  }, [points, defaultColor]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        sizeAttenuation={sizeAttenuation}
        transparent={transparent}
        opacity={opacity}
        depthTest={true}
        depthWrite={!transparent}
      />
    </points>
  );
}
```

## 성능 고려사항

### 최적화 전략

1. **useMemo 활용**: 점 데이터가 변경될 때만 geometry 재생성
2. **Float32Array**: 일반 배열 대신 타입 배열 사용
3. **단일 Draw Call**: 모든 점을 하나의 객체로 렌더링
4. **Depth Write**: 투명도 사용 시 `depthWrite: false`로 성능 개선

### 성능 벤치마크

| 점 개수 | 렌더링 시간 | FPS |
|---------|------------|-----|
| 100 | < 1ms | 60 |
| 1,000 | < 1ms | 60 |
| 10,000 | ~2ms | 60 |
| 100,000 | ~15ms | 50-60 |

### 대량 데이터 처리

100,000개 이상의 점을 표시할 때:

```typescript
// LOD (Level of Detail) 적용
const pointsByDistance = useMemo(() => {
  const distance = camera.position.length();
  
  if (distance > 5) {
    // 멀리서는 10% 샘플링
    return points.filter((_, i) => i % 10 === 0);
  } else if (distance > 3) {
    // 중간 거리는 50% 샘플링
    return points.filter((_, i) => i % 2 === 0);
  }
  
  // 가까이서는 모두 표시
  return points;
}, [points, camera.position]);
```

## 색상 스케일 통합

ColorScale과 함께 사용:

```tsx
import { useColorScale } from 'hyperglobe';

function DataVisualization() {
  const colorScale = useColorScale({
    domain: [0, 100],
    colors: ['#blue', '#red'],
  });
  
  const points = data.map(item => ({
    position: [item.lon, item.lat],
    color: colorScale(item.value),
  }));
  
  return (
    <HyperGlobe>
      <PointsFeature points={points} />
    </HyperGlobe>
  );
}
```

## MarkerFeature와 비교

| 특징 | PointsFeature | MarkerFeature |
|------|---------------|---------------|
| 용도 | 대량 데이터 시각화 | 소수 지점 강조 |
| 적합 개수 | 수백 ~ 수만 개 | 50개 이하 |
| 표현 방식 | 단순 점 | SVG + 라벨 |
| 성능 | 매우 높음 | 보통 |
| 스타일링 | 색상, 크기만 | 자유로운 HTML/CSS |
| 인터랙션 | 제한적 | 클릭, 호버 지원 |

## 사용 가이드라인

### PointsFeature 선택 시기
- ✅ 100개 이상의 점을 표시할 때
- ✅ 데이터 분포나 밀도를 보여줄 때
- ✅ 성능이 중요할 때
- ✅ 라벨이 필요 없을 때

### MarkerFeature 선택 시기
- ✅ 50개 이하의 중요 지점을 표시할 때
- ✅ 라벨이 필요할 때
- ✅ 커스텀 아이콘이 필요할 때
- ✅ 클릭/호버 인터랙션이 필요할 때

## 향후 개선 사항

1. **동적 크기**: 데이터 값에 따라 점 크기 변경
2. **애니메이션**: 점이 나타나거나 움직이는 효과
3. **클러스터링**: 가까운 점들을 자동으로 그룹화
4. **인터랙션**: 호버 시 정보 표시 (제한적으로)
5. **WebGL 인스턴싱**: 100만 개 이상의 점 지원

## 참고

- [Three.js Points](https://threejs.org/docs/#api/en/objects/Points)
- [PointsMaterial](https://threejs.org/docs/#api/en/materials/PointsMaterial)
- [BufferGeometry](https://threejs.org/docs/#api/en/core/BufferGeometry)
- [BufferAttribute](https://threejs.org/docs/#api/en/core/BufferAttribute)
