export interface HyperGlobeProps {
  width?: number;
}

export function HyperGlobe(props: HyperGlobeProps) {
  return <div style={{ width: props.width }}>Hello Multiverse</div>;
}
