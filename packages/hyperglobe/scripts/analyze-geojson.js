#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GeoJSON 파일을 분석하여 폴리곤과 좌표 정보를 추출하는 함수
 */
function analyzeGeoJSON(filePath) {
  console.log(`\n🌍 분석 중: ${path.basename(filePath)}`);
  console.log('='.repeat(50));

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const geoData = JSON.parse(fileContent);

    const stats = {
      totalFeatures: 0,
      polygons: 0,
      multiPolygons: 0,
      lineStrings: 0,
      multiLineStrings: 0,
      points: 0,
      multiPoints: 0,
      others: 0,
      totalCoordinates: 0,
      totalRings: 0,
      maxCoordinatesInSingleFeature: 0,
      maxCoordinatesFeatureName: '',
    };

    if (geoData.type === 'FeatureCollection' && geoData.features) {
      stats.totalFeatures = geoData.features.length;

      geoData.features.forEach((feature, index) => {
        const geometry = feature.geometry;
        if (!geometry) return;

        let featureCoordinateCount = 0;
        const featureName =
          feature.properties?.name || feature.properties?.NAME || `Feature ${index + 1}`;

        switch (geometry.type) {
          case 'Polygon':
            stats.polygons++;
            stats.totalRings += geometry.coordinates.length;
            geometry.coordinates.forEach((ring) => {
              featureCoordinateCount += ring.length;
              stats.totalCoordinates += ring.length;
            });
            break;

          case 'MultiPolygon':
            stats.multiPolygons++;
            geometry.coordinates.forEach((polygon) => {
              stats.totalRings += polygon.length;
              polygon.forEach((ring) => {
                featureCoordinateCount += ring.length;
                stats.totalCoordinates += ring.length;
              });
            });
            break;

          case 'LineString':
            stats.lineStrings++;
            featureCoordinateCount = geometry.coordinates.length;
            stats.totalCoordinates += featureCoordinateCount;
            break;

          case 'MultiLineString':
            stats.multiLineStrings++;
            geometry.coordinates.forEach((line) => {
              featureCoordinateCount += line.length;
              stats.totalCoordinates += line.length;
            });
            break;

          case 'Point':
            stats.points++;
            featureCoordinateCount = 1;
            stats.totalCoordinates += 1;
            break;

          case 'MultiPoint':
            stats.multiPoints++;
            featureCoordinateCount = geometry.coordinates.length;
            stats.totalCoordinates += featureCoordinateCount;
            break;

          default:
            stats.others++;
            break;
        }

        // 가장 많은 좌표를 가진 피처 추적
        if (featureCoordinateCount > stats.maxCoordinatesInSingleFeature) {
          stats.maxCoordinatesInSingleFeature = featureCoordinateCount;
          stats.maxCoordinatesFeatureName = featureName;
        }
      });
    }

    // 결과 출력
    console.log(`📊 전체 피처 수: ${stats.totalFeatures.toLocaleString()}`);
    console.log(`📈 총 좌표 개수: ${stats.totalCoordinates.toLocaleString()}`);
    console.log();

    console.log('🔷 피처 타입별 분포:');
    if (stats.polygons > 0) console.log(`  • Polygon: ${stats.polygons.toLocaleString()}`);
    if (stats.multiPolygons > 0)
      console.log(`  • MultiPolygon: ${stats.multiPolygons.toLocaleString()}`);
    if (stats.lineStrings > 0) console.log(`  • LineString: ${stats.lineStrings.toLocaleString()}`);
    if (stats.multiLineStrings > 0)
      console.log(`  • MultiLineString: ${stats.multiLineStrings.toLocaleString()}`);
    if (stats.points > 0) console.log(`  • Point: ${stats.points.toLocaleString()}`);
    if (stats.multiPoints > 0) console.log(`  • MultiPoint: ${stats.multiPoints.toLocaleString()}`);
    if (stats.others > 0) console.log(`  • 기타: ${stats.others.toLocaleString()}`);

    if (stats.totalRings > 0) {
      console.log();
      console.log(`🔗 총 링(Ring) 개수: ${stats.totalRings.toLocaleString()}`);
      console.log(
        `📏 평균 링당 좌표: ${Math.round(stats.totalCoordinates / stats.totalRings).toLocaleString()}`
      );
    }

    if (stats.maxCoordinatesInSingleFeature > 0) {
      console.log();
      console.log(`🏆 최대 좌표 개수를 가진 피처:`);
      console.log(`  • 이름: ${stats.maxCoordinatesFeatureName}`);
      console.log(`  • 좌표 개수: ${stats.maxCoordinatesInSingleFeature.toLocaleString()}`);
    }

    // 파일 크기 정보
    const fileSizeBytes = fs.statSync(filePath).size;
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
    console.log();
    console.log(`💾 파일 크기: ${fileSizeMB}MB`);
    console.log(
      `📐 좌표당 평균 바이트: ${Math.round(fileSizeBytes / stats.totalCoordinates)} bytes`
    );

    return stats;
  } catch (error) {
    console.error(`❌ 파일 분석 중 오류 발생: ${error.message}`);
    return null;
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  const dataDir = path.join(__dirname, 'src', 'data');
  const geoJsonFiles = ['world-low.geo.json', 'world-mid.geo.json', 'world-high.geo.json'];

  console.log('🌍 GeoJSON 파일 분석 도구');
  console.log('='.repeat(50));
  console.log(`📁 분석 대상 폴더: ${dataDir}`);

  const allStats = [];

  geoJsonFiles.forEach((fileName) => {
    const filePath = path.join(dataDir, fileName);

    if (fs.existsSync(filePath)) {
      const stats = analyzeGeoJSON(filePath);
      if (stats) {
        allStats.push({ fileName, stats });
      }
    } else {
      console.log(`⚠️  파일을 찾을 수 없습니다: ${fileName}`);
    }
  });

  // 전체 요약
  if (allStats.length > 1) {
    console.log('\n\n📋 전체 요약');
    console.log('='.repeat(50));

    console.log('파일명\t\t\t피처 수\t\t총 좌표 수');
    console.log('-'.repeat(60));

    allStats.forEach(({ fileName, stats }) => {
      const name = fileName.replace('.geo.json', '').padEnd(15);
      const features = stats.totalFeatures.toLocaleString().padStart(8);
      const coordinates = stats.totalCoordinates.toLocaleString().padStart(12);
      console.log(`${name}\t${features}\t${coordinates}`);
    });

    // 파일 간 비교
    const lowRes = allStats.find((s) => s.fileName.includes('low'));
    const midRes = allStats.find((s) => s.fileName.includes('mid'));
    const highRes = allStats.find((s) => s.fileName.includes('high'));

    if (lowRes && highRes) {
      const coordinateRatio = (
        highRes.stats.totalCoordinates / lowRes.stats.totalCoordinates
      ).toFixed(1);
      console.log();
      console.log(`📊 해상도 비교:`);
      console.log(`  • high 대비 low 해상도: ${coordinateRatio}배 더 많은 좌표`);

      if (midRes) {
        const midRatio = (highRes.stats.totalCoordinates / midRes.stats.totalCoordinates).toFixed(
          1
        );
        console.log(`  • high 대비 mid 해상도: ${midRatio}배 더 많은 좌표`);
      }
    }
  }

  console.log('\n✅ 분석 완료!');
}

// 스크립트 실행
main();

export { analyzeGeoJSON };
