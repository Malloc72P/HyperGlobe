# 메인 스토어 (MainStore)

## 개요

메인 스토어는 HyperGlobe의 전역 상태를 관리하는 Zustand 기반 스토어입니다. 호버 상태, 툴팁, 공간 인덱싱(R-Tree) 등을 중앙에서 관리합니다.

## 위치

`packages/hyperglobe/src/store/main-store.ts`

## 주요 상태

### hoveredRegion
```typescript
hoveredRegion: RegionModel | null
```

현재 마우스로 호버 중인 지역의 모델 정보입니다.

**사용처:**
- ColorScaleBar: 호버된 지역의 값 위치에 마커 표시
- Tooltip: 호버된 지역의 정보 표시
- RegionFeature: 호버 스타일 적용

**업데이트:**
- 마우스 이동 시 자동으로 감지되어 업데이트
- R-Tree를 사용하여 효율적으로 지역 찾기

### loading
```typescript
loading: boolean
```

지도 데이터 로딩 상태입니다.

**용도:**
- 로딩 인디케이터 표시
- 초기 렌더링 시 로딩 상태 관리

**기본값:** `true`

### tooltipRef
```typescript
tooltipRef: RefObject<HTMLDivElement | null> | null
```

툴팁 DOM 요소에 대한 참조입니다.

**용도:**
- 툴팁 위치 계산
- 툴팁 크기 측정 (화면 밖으로 나가지 않도록)

### tree (R-Tree)
```typescript
tree: RBush<RegionModel>
```

공간 인덱싱을 위한 R-Tree 자료구조입니다.

**역할:**
- 각 지역의 경계 상자(Bounding Box) 저장
- 마우스 포인터 위치에서 빠르게 지역 찾기
- O(log n) 검색 성능

**왜 필요한가:**
- 단순 배열 순회: O(n) - 지역이 많을수록 느려짐
- R-Tree 사용: O(log n) - 수백 개 지역에도 빠른 응답

**라이브러리:** [RBush](https://github.com/mourner/rbush)

### getTooltipPosition
```typescript
getTooltipPosition: UpdateTooltipPositionFn | null
```

툴팁 위치를 계산하는 함수입니다.

**시그니처:**
```typescript
interface UpdateTooltipPositionFnParam {
  point: Coordinate;              // 툴팁을 표시할 좌표
  tooltipElement: HTMLDivElement; // 툴팁 DOM 요소
}

type UpdateTooltipPositionFn = (param: UpdateTooltipPositionFnParam) => Coordinate | null;
```

**역할:**
- 툴팁이 화면 밖으로 나가면 위치 조정
- null 반환 시 툴팁 숨김

## 주요 액션

### 로딩 상태 관리

#### setLoading
```typescript
setLoading: (loading: boolean) => void
```

로딩 상태를 설정합니다.

**사용 예시:**
```typescript
const setLoading = useMainStore((s) => s.setLoading);

// 데이터 로딩 시작
setLoading(true);

// 데이터 로딩 완료
setLoading(false);
```

### 호버 관리

#### setHoveredRegion
```typescript
setHoveredRegion: (regionModel: RegionModel | null) => void
```

호버된 지역을 설정합니다.

**사용 예시:**
```typescript
const setHoveredRegion = useMainStore((s) => s.setHoveredRegion);

// 마우스 진입
onPointerEnter={() => setHoveredRegion(region)}

// 마우스 이탈
onPointerLeave={() => setHoveredRegion(null)}
```

#### findRegionModelById
```typescript
findRegionModelById: (id: string) => RegionModel | null
```

ID로 지역 모델을 찾습니다.

**사용 예시:**
```typescript
const findRegionModelById = useMainStore((s) => s.findRegionModelById);
const korea = findRegionModelById('KOR');
```

### R-Tree 관리

#### insertRegionModel
```typescript
insertRegionModel: (regionModel: RegionModel) => void
```

지역의 경계 상자를 R-Tree에 추가합니다.

**언제 호출:**
- RegionFeature 컴포넌트가 마운트될 때

**내부 동작:**
```typescript
const tree = get().tree;
tree.insert(regionModel);
```

#### removeRegionModel
```typescript
removeRegionModel: (regionModel: RegionModel) => void
```

지역의 경계 상자를 R-Tree에서 제거합니다.

**언제 호출:**
- RegionFeature 컴포넌트가 언마운트될 때

#### clearRTree
```typescript
clearRTree: () => void
```

R-Tree의 모든 데이터를 제거합니다.

**언제 호출:**
- HyperGlobe 컴포넌트가 언마운트될 때
- 지도 데이터를 완전히 교체할 때

### 툴팁 관리

#### registerTooltipRef
```typescript
registerTooltipRef: (ref: RefObject<HTMLDivElement | null>) => void
```

툴팁 DOM 요소의 참조를 등록합니다.

**사용 예시:**
```typescript
const tooltipRef = useRef<HTMLDivElement>(null);
const registerTooltipRef = useMainStore((s) => s.registerTooltipRef);

useEffect(() => {
  registerTooltipRef(tooltipRef);
}, []);
```

### 초기화

#### init
```typescript
init: () => void
```

스토어를 초기화합니다.

**동작:**
- R-Tree 초기화

#### clean
```typescript
clean: () => void
```

스토어를 정리합니다.

**동작:**
- R-Tree 초기화
- 메모리 정리

## 사용 예시

### 컴포넌트에서 상태 구독

```typescript
import { useMainStore } from 'src/store';

function MyComponent() {
  // 특정 상태만 구독 (성능 최적화)
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);
  const setHoveredRegion = useMainStore((s) => s.setHoveredRegion);
  
  return (
    <div>
      {hoveredRegion ? hoveredRegion.name : 'No region hovered'}
    </div>
  );
}
```

### RegionFeature에서 R-Tree 등록

```typescript
function RegionFeature({ feature }: RegionFeatureProps) {
  const insertRegionModel = useMainStore((s) => s.insertRegionModel);
  const removeRegionModel = useMainStore((s) => s.removeRegionModel);
  const [regionModel] = useRegionModel({ feature, data });

  // 마운트 시 R-Tree에 등록
  useEffect(() => {
    if (regionModel) {
      insertRegionModel(regionModel);
      return () => removeRegionModel(regionModel);
    }
  }, [regionModel]);

  // ...
}
```

### ColorScaleBar에서 호버 상태 사용

```typescript
function ColorScaleBar({ colorScale }: ColorScaleBarProps) {
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);
  
  const markerPosition = useMemo(() => {
    const value = hoveredRegion?.data?.value;
    if (!value) return 0;
    
    // 값의 위치 계산
    const step = findStepByValue(colorScale, value);
    // ... 위치 계산 로직
    
    return position;
  }, [hoveredRegion, colorScale]);

  return (
    <div>
      <div className="marker" style={{ left: `${markerPosition}%` }} />
      {/* ... */}
    </div>
  );
}
```

## Zustand 선택적 구독

Zustand의 강력한 기능 중 하나는 **선택적 구독**입니다.

```typescript
// ❌ 나쁜 예: 전체 스토어 구독 (불필요한 리렌더링)
const store = useMainStore();

// ✅ 좋은 예: 필요한 상태만 구독
const hoveredRegion = useMainStore((s) => s.hoveredRegion);
```

**선택적 구독의 장점:**
- 해당 상태가 변경될 때만 리렌더링
- 다른 상태 변경에는 영향 없음
- 성능 최적화

## RegionModel 인터페이스

R-Tree에 저장되는 RegionModel의 구조:

```typescript
interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface RegionModel<DATA_TYPE = any> extends BoundingBox {
  id: string;                      // 지역 ID
  name: string;                    // 지역 이름
  bboxSize: number;                // 바운딩 박스 크기 (width * height)
  polygons: FeaturePolygons[];     // 지역의 폴리곤 좌표 배열
  data?: DATA_TYPE;                // 추가 데이터 (예: GDP, 인구 등)
  properties: Record<string, any>; // 기타 속성
}
```

**참고:** `RegionModel`은 `BoundingBox`를 extend하므로 R-Tree에서 직접 사용 가능합니다.

## 성능 최적화

### R-Tree를 사용한 공간 검색

**시나리오:** 200개 지역이 있는 세계 지도에서 마우스 호버 감지

**단순 배열 순회:**
```typescript
// O(n) - 200번 반복
const region = regions.find(r => isPointInRegion(point, r));
```

**R-Tree 사용:**
```typescript
// O(log n) - 약 8번 검색
const candidates = tree.search({
  minX: point[0],
  minY: point[1],
  maxX: point[0],
  maxY: point[1]
});
```

**결과:**
- 배열: 200번 검사
- R-Tree: 8번 검사 → **25배 빠름**

### 선택적 구독

각 컴포넌트는 필요한 상태만 구독하여 불필요한 리렌더링을 방지합니다.

```typescript
// ColorScaleBar: hoveredRegion만 구독
const hoveredRegion = useMainStore((s) => s.hoveredRegion);

// Tooltip: hoveredRegion과 tooltipRef만 구독
const hoveredRegion = useMainStore((s) => s.hoveredRegion);
const tooltipRef = useMainStore((s) => s.tooltipRef);
```

## 디버깅

### Zustand DevTools

Zustand DevTools를 사용하여 상태 변경을 추적할 수 있습니다.

```typescript
import { devtools } from 'zustand/middleware';

export const useMainStore = create<MainStore>()(
  devtools(
    (set, get) => ({
      // ... 스토어 구현
    }),
    { name: 'MainStore' }
  )
);
```

### 콘솔에서 스토어 접근

```javascript
// 브라우저 콘솔에서
const store = useMainStore.getState();
console.log(store.hoveredRegion);
console.log(store.tree.all());  // 모든 지역 보기
```

## 주의사항

1. **R-Tree 동기화**: RegionFeature가 추가/제거될 때 반드시 R-Tree도 업데이트해야 합니다
2. **메모리 누수 방지**: 컴포넌트 언마운트 시 `removeRegionModel` 호출 필수
3. **선택적 구독**: 성능을 위해 항상 필요한 상태만 구독
4. **불변성**: 스토어 상태를 직접 수정하지 말고 액션을 통해 업데이트

## 관련 문서
- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeature 컴포넌트](./region-feature.md)
- [ColorScale 시스템](./colorscale.md)
- 성능 최적화: `docs/성능_최적화_요약.md`
