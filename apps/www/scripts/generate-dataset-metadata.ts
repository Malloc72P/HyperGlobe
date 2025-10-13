import {
  DatasetFieldType,
  DatasetMetadata,
  DatasetMetadataCollection,
  DatasetSchema,
} from '@libs/types/dataset';
import fs from 'fs';
import path from 'path';

const datasetDir = './public/dataset';
const metadataPath = `./libs/constants/dataset.meta.json`;

main();

async function main() {
  const datasetList = fs.readdirSync(datasetDir);
  const metadataList: DatasetMetadata[] = [];

  // 모든 데이터셋 파일을 읽어서 메타데이터를 생성합니다.
  // 데이터셋 파일은 JSON 형식이어야 하며, 각 파일은 id, title, description, data 필드를 포함해야 합니다.
  // 또한 원본 데이터에 schema 속성을 추가합니다.
  // schema는 data의 첫 번째 항목을 기반으로 생성됩니다.
  for (const datasetName of datasetList) {
    const datasetPath = path.join(datasetDir, datasetName);
    const jsonData = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    const { id, title, description, data } = jsonData;

    // 첫번째 데이터 항목을 기반으로 스키마를 생성합니다.
    const schema = generateSchema(data);

    const metadata: DatasetMetadata = {
      id,
      title,
      description,
      schema,
      example: data.slice(0, 10), // 예시 데이터는 첫 5개 항목으로 제한합니다.
      filename: datasetName,
    };

    // 원본 데이터에 스키마를 추가합니다.
    jsonData.schema = schema;
    fs.writeFileSync(datasetPath, JSON.stringify(jsonData, null, 2));

    metadataList.push(metadata);
  }

  const collection: DatasetMetadataCollection = {
    list: metadataList,
  };

  fs.writeFileSync(metadataPath, JSON.stringify(collection, null, 2));
}

/**
 * 첫번째 데이터 항목을 기반으로 스키마를 생성합니다.
 */
function generateSchema(data: any[]): DatasetSchema[] {
  const schema: DatasetSchema[] = [];

  for (const key in data[0]) {
    const value = data[0][key];
    let type: DatasetFieldType;

    if (typeof value === 'number') {
      type = 'number';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
    } else if (value instanceof Date) {
      type = 'date';
    } else if (Array.isArray(value)) {
      type = 'array';
    } else if (typeof value === 'object') {
      type = 'object';
    } else {
      type = 'string';
    }

    schema.push({ key, type });
  }

  return schema;
}
