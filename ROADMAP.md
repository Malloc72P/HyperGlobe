# HyperGlobe 재설계 로드맵

2D 평면 맵차트 라이브러리로의 재설계 계획. 다양한 투영(projection)을 갈아끼워
맵차트를 만드는 것을 목표로 한다.

## 1. 배경 — 왜 재설계하는가

현재 HyperGlobe(three.js + r3f + HGM 포맷)는 열린 이슈 54개를 안고 있고, 그 중
상당수가 **HGM 데이터 파이프라인**에서 파생된 부채다. three.js 자체가 문제가
아니라, 아래 세 가지가 복잡도의 진짜 근원이다.

- **HGM 파이프라인**: 압축 바이너리 지오메트리를 굽고 → 별도 패키지로 배포 →
  CDN에서 받아 → 풀어서 파싱. 이중 패키지·CDN URL 분기·DecompressionStream
  의존이 전부 여기서 나온다.
- **r3f 의존**: "컴포넌트만 꽂으면 동작"이라 라이브러리 설계 역량이 드러나지 않는다.
- **설계 규율 부재**: model/view 분리 없음, CI 품질 게이트(lint/test/typecheck) 전무.

> 결론: 데이터 파이프라인을 GeoJSON + 투영으로 단순화하고, 렌더링 백엔드와
> 설계 규율을 처음부터 바로잡는다.

## 2. 목표 / 비목표

### 목표

- **2D 평면 맵차트** — Mercator, Equirectangular, Orthographic 등 다양한 투영 지원.
- **Orthographic + 회전** — 진짜 3D 없이 Canvas 2D로 "돌아가는 지구본" 비주얼.
- **성능과 설계를 모두** — Canvas 2D 백엔드(성능) + retained 씬그래프/계층 분리(설계).
- **포트폴리오 가치** — Canvas 위에 씬그래프·히트테스트를 직접 구현해 저수준 렌더링
  제어와 아키텍처 설계 역량을 함께 증명.

### 비목표 (지금은 하지 않음)

- 처음부터 멀티 패키지 모노레포(과설계). 단일 패키지로 시작한다.
- three.js / WebGL 백엔드. `RenderContext` 경계 뒤에 "미래 확장"으로만 남긴다.
- 타일맵·벡터타일·히트맵 등 부가 기능. 코어가 단단해진 뒤로 미룬다.

## 3. 핵심 설계 결정

| 축 | 결정 | 이유 |
| --- | --- | --- |
| 렌더링 백엔드 | **Canvas 2D** | SVG는 노드 수천 개에서 렉. Canvas는 성능 천장이 높다(Konva·amCharts 검증). |
| 객체 모델 | **retained 씬그래프** | Canvas 위에 직접 구현. 성능과 "SVG 같은 설계"를 동시에. |
| 투영 | **Projection 전략 패턴** | 다양한 투영을 갈아끼우는 핵심. d3-geo를 인터페이스 뒤에 숨김. |
| 투영 구현 | **d3-geo로 시작** | 수십 개 투영 + 클리핑이 검증됨. 인터페이스 뒤라 추후 직접 구현 교체 가능. |
| 백엔드 경계 | **RenderContext 인터페이스** | Canvas2D 구현 1개로 시작. 미래에 three.js 어댑터 추가 여지. |
| 프레임워크 | **vanilla 코어 + 얇은 어댑터** | 코어는 프레임워크 독립. react 어댑터는 나중에 얇게. |

## 4. 아키텍처 (레이어)

```
공개 API · options
        │
model 계층   : GeoSource(GeoJSON) · DataBinding · Projection(전략, d3-geo 숨김)
        │  (project → 좌표)
view 계층    : RegionLayer · Marker/Route · hit-test · z-order · dirty-rect  (retained scene graph)
        │  (draw 호출)
render context: Canvas2DContext(지금)   …   ThreeContext(미래)
        │
interaction  : rotate→Projection,  pan·zoom·hover→view
```

데이터 흐름: `GeoSource → DataBinding → Projection.project → SceneNode 좌표 갱신
→ (dirty일 때) RenderContext.draw`. 회전/팬/줌은 Projection 또는 view transform만
건드리고 씬그래프는 재사용한다(성능 핵심).

## 5. 핵심 인터페이스

```ts
// 투영 전략 — d3-geo를 이 뒤에 숨긴다. orthographic 뒷면은 null로 클리핑.
interface Projection {
  project(lonLat: [number, number]): [number, number] | null;
  invert(xy: [number, number]): [number, number] | null;
  rotate(r: [number, number, number?]): void; // orthographic 회전 진입점
  fit(size: Size, geo: GeoJSON): void;
}

// 백엔드 경계 — 지금은 Canvas2D 하나만 구현.
interface RenderContext {
  clear(): void;
  drawPath(points: Point[]): void;
  fill(style: Style): void;
  stroke(style: Style): void;
}

// retained 씬그래프 노드 — Canvas 위에 직접 얹는 부분.
interface SceneNode {
  draw(ctx: RenderContext): void;
  hitTest(p: Point): SceneNode | null;
  bounds: Rect;
}
```

## 6. 단계별 로드맵

각 단계는 "완료 판정(verify)"이 통과해야 다음으로 넘어간다.

### Phase 0 — 프로젝트 셋업 & 규율

- 새 레포 / 단일 패키지, TypeScript, 번들러(vite) 설정.
- **CI 품질 게이트를 1번 커밋부터**: lint · test(vitest) · typecheck · build.
- 예제 페이지(html+js) + Playwright e2e 골격 (Storybook은 쓰지 않음).
- verify: 빈 커밋에도 CI 4종이 초록.

### Phase 1 — 렌더링 코어 MVP

- `RenderContext` 인터페이스 + `Canvas2DContext` 구현.
- `SceneNode` 씬그래프 + draw 루프 + rAF 기반 dirty 스케줄.
- verify: 사각형/경로 몇 개를 Canvas에 그리고, dirty일 때만 리페인트.

### Phase 2 — 투영 전략

- `Projection` 인터페이스 + `D3Projection`(**mercator + orthographic 둘**).
- verify: 같은 GeoJSON이 투영 교체만으로 다르게 그려진다(전략 교체 검증).

### Phase 3 — 지오데이터 & RegionLayer

- GeoJSON 로드 → `RegionLayer` 폴리곤 렌더 → 코로플레스(값→색) 바인딩.
- verify: 세계 지도가 Mercator/Orthographic 양쪽에서 채색되어 표시.

### Phase 4 — 인터랙션

- pan / zoom (view transform), **orthographic drag-rotate**(돌아가는 지구본),
  hover hit-test(처음엔 point-in-polygon).
- verify: 드래그로 지구본이 회전하고, 마우스오버한 지역이 하이라이트.

### Phase 5 — 맵차트 기능

- legend · tooltip · color scale, 데이터 바인딩 다듬기.
- verify: 값 기반 범례·툴팁이 실제 데이터와 일치.

### Phase 6 — 확장 & 최적화

- Marker/Route 레이어, hit-test를 R-tree로 교체, 성능 회귀 측정 수단.
- verify: 대량 지역/마커에서 프레임 드랍 없이 인터랙션.

### Phase 7 — 어댑터 · 문서 · 배포

- 얇은 react 어댑터, 사용 문서/데모, npm 배포(files/sideEffects/LICENSE 정비).
- verify: 외부 프로젝트에서 설치해 동작.

### 장기 (보류)

- `ThreeContext`(three.js) 백엔드, 추가 투영, 타일/벡터 레이어, vue 어댑터.

## 7. 처음부터 지킬 규율 (이전 프로젝트가 놓친 것)

1. **CI 게이트 먼저** — lint/test/typecheck를 1번 커밋부터. (이전: 전무)
2. **추상화는 두 번째 구현으로 검증** — 투영을 2개(mercator+orthographic) 만들어
   `Projection` 인터페이스가 진짜 교체 가능한지 즉시 확인.
3. **단일 패키지로 시작** — 멀티 패키지 분리는 경계가 실증된 뒤에만.
4. **공개 API에 죽은 prop 금지** — 선언했으면 반드시 배선·테스트.
