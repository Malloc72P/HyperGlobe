import z from 'zod';
import { DatasetPreviewDto } from './dataset-preview.dto';

export const FindDatasetsActionParamSchema = z.object({});

export type FindDatasetsActionParam = z.infer<typeof FindDatasetsActionParamSchema>;

export interface FindDatasetsActionResult {
  datasets: DatasetPreviewDto[];
}
