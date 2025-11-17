'use client';

import { NextHyperGlobeDemo } from './(demos)/basic/next-hyperglobe-demo';

export default function Home() {
  return (
    <div className="p-5">
      <div className="p-5 border border-gray-300 rounded-xl shadow-md">
        <h1 className="text-2xl">NEXT.JS</h1>
        <p className="text-gray-500">HyperGlobe 예제 목록</p>
        <ul className="list-disc pl-5">
          <li className="cursor-pointer hover:underline">
            <a href="/basic">Basic Example</a>
          </li>
          <li className="cursor-pointer hover:underline">
            <a href="/colorscale">ColorScale Example</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
