import React from 'react';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

export interface AdminMetricItem {
  label: string;
  value: string | number;
  note?: string;
  tone?: 'default' | 'accent' | 'positive' | 'warn';
}

export const AdminMetricStrip: React.FC<{
  items: AdminMetricItem[];
  columns?: 3 | 4;
}> = ({ items, columns = 4 }) => {
  const gridCols =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

  const toneText: Record<NonNullable<AdminMetricItem['tone']>, string> = {
    default: 'text-[#17324d]',
    accent: 'text-[#0667d0]',
    positive: 'text-emerald-700',
    warn: 'text-[#c2410c]',
  };

  return (
    <div
      className={`rounded-xl bg-white border border-[#dfe6f0] grid ${gridCols} divide-y sm:divide-y-0 sm:divide-x divide-[#eef2f7]`}
    >
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3.5 sm:px-5 sm:py-4 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#52657a] truncate">
            {item.label}
          </div>
          <div
            className={`text-[22px] sm:text-[24px] font-extrabold leading-tight tracking-[-0.02em] mt-1 tabular-nums ${
              toneText[item.tone ?? 'default']
            }`}
          >
            {item.value}
          </div>
          {item.note && (
            <div className="text-[12px] text-[#52657a] mt-0.5 truncate">{item.note}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export interface AdminKpiCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  tone?: 'blue' | 'orange' | 'emerald' | 'slate';
}

const KPI_TONE_CLASSES: Record<NonNullable<AdminKpiCardProps['tone']>, string> = {
  blue: 'bg-[#eff5ff] text-[#0667d0]',
  orange: 'bg-[#fff2e9] text-[#c2410c]',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-[#17324d]',
};

export const AdminKpiCard: React.FC<AdminKpiCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  tone = 'blue',
}) => {
  return (
    <div className="rounded-xl bg-white border border-[#dfe6f0] p-4 flex flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-[#52657a]">{label}</span>
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${KPI_TONE_CLASSES[tone]}`}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div>
        <div
          className={`text-[22px] font-extrabold leading-tight tabular-nums ${
            tone === 'orange' ? 'text-[#c2410c]' : 'text-[#17324d]'
          }`}
        >
          {value}
        </div>
        <div className="text-[12px] text-[#52657a] mt-0.5">{subtext}</div>
      </div>
    </div>
  );
};

export interface AdminPaginationProps {
  pageIndex: number;
  pageCount: number;
  totalRows: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (nextIndex: number) => void;
  onPageSizeChange?: (nextSize: number) => void;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  pageIndex,
  pageCount,
  totalRows,
  pageSize,
  itemLabel,
  onPageChange,
  onPageSizeChange,
}) => {
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(totalRows, (pageIndex + 1) * pageSize);

  return (
    <div className="px-4 sm:px-5 py-3.5 border-t border-[#eef2f7] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#52657a]">
      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          Hiển thị <strong className="text-[#17324d]">{start}–{end}</strong> trong tổng số{' '}
          <strong className="text-[#17324d]">{totalRows}</strong> {itemLabel}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            aria-label="Số dòng mỗi trang"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 rounded-lg border border-[#dfe6f0] bg-white text-[12px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0] cursor-pointer"
          >
            {[6, 8, 12, 20].map((size) => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0}
          aria-label="Trang trước"
          className="w-8 h-8 rounded-lg border border-[#dfe6f0] bg-white hover:bg-[#f8faff] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#17324d] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.max(1, pageCount) }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onPageChange(idx)}
            className={`min-w-8 h-8 px-2 rounded-lg text-[12px] font-bold transition cursor-pointer tabular-nums ${
              pageIndex === idx
                ? 'bg-[#0667d0] text-white'
                : 'border border-[#dfe6f0] bg-white text-[#52657a] hover:text-[#17324d]'
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount - 1, pageIndex + 1))}
          disabled={pageIndex >= pageCount - 1}
          aria-label="Trang sau"
          className="w-8 h-8 rounded-lg border border-[#dfe6f0] bg-white hover:bg-[#f8faff] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#17324d] cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
