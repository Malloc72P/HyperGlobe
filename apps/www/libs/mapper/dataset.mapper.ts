import { DatasetPreviewDto } from '@libs/dto';
import { Dataset } from '@prisma/client';

export function toDatasetPreviewDto(dataset: Dataset): DatasetPreviewDto {
  return {
    id: dataset.id,
    title: dataset.title,
    description: dataset.description,
    ownerId: dataset.ownerId,
    createdAt: dataset.createdAt,
    updatedAt: dataset.updatedAt,
  };
}
