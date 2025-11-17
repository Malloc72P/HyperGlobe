'use client';

import { ColorScaleDemo } from './next-colorscale-demo';

export default function Home() {
  return (
    <div className="p-5">
      <div className="p-5 border border-gray-300 rounded-xl shadow-md">
        <h1 className="text-2xl">NEXT.JS</h1>
        <p className="text-gray-500">HyperGlobe 컬러스케일 예제</p>
        <ColorScaleDemo />
      </div>
    </div>
  );
}
