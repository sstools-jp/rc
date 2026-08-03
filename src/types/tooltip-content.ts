/** ツールチップのコンテンツ型 */
export interface TooltipContent {
  title?: string;
  line: string;
  nestedLines?: Array<string | TooltipContent>;
}

/** ツールチップのコンテンツ (文字列またはTooltipContent) */
export type TooltipContentValue = string | TooltipContent | Array<string | TooltipContent>;
