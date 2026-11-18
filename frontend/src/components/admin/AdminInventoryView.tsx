import React, { useCallback, useMemo, useState } from 'react';
import { flexRender, type RowSelectionState, type SortingState } from '@tanstack/react-table';
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  legacyCreateColumnHelper as createColumnHelper,
  type LegacyColumnDef,
} from '@tanstack/react-table/legacy';
import {
  Download,
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import type { ProductCategory, ProductItem } from '../../data/mockData';
import { formatCurrency } from '../../data/mockData';
import {
  ADMIN_CATEGORY_LABELS,
  downloadCsvFile,
  type InventoryMode,
} from '../../data/adminData';
import type { ConfirmDialogState } from '../ConfirmDialog';
import { AdminPagination } from './AdminUiPrimitives';

interface AdminInventoryViewProps {
  products: ProductItem[];
  mode?: InventoryMode;
  readOnly?: boolean;
  onSaveProduct: (item: ProductItem, isNew: boolean) => void;
  onDeleteProduct: (id: string) => void;
  onRequestConfirm: (dialog: ConfirmDialogState) => void;
  onNotify: (msg: string) => void;
}

const columnHelper = createColumnHelper<ProductItem>();

const SUBTYPE_OPTIONS_BY_CAT: Record<Exclude<ProductCategory, 'spa'>, string[]> = {
  food: ['Dinh dưỡng & Hạt khô', 'Pate & Sốt thưởng'],
  hygiene: ['Thuốc & Chăm sóc da', 'Sữa tắm & Vệ sinh'],
  bed: ['Giường - Nệm - Thảm', 'Lồng - Chuồng'],
  backpack: ['Địu - Balo - Túi xách', 'Dây dắt - Vòng cổ', 'Hộp cát & Khay vệ sinh', 'Dụng cụ ăn uống'],
};

export const AdminInventoryView: React.FC<AdminInventoryViewProps> = ({
  products,
  mode = 'catalog',
  readOnly = false,
  onSaveProduct,
  onDeleteProduct,
  onRequestConfirm,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Exclude<ProductCategory, 'spa'>>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'in-stock' | 'promo'>(
    mode === 'stock' ? 'low' : 'all'
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for add/edit modal
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('PETSFRIEND SELECT');
  const [formCat, setFormCat] = useState<Exclude<ProductCategory, 'spa'>>('food');
  const [formSubType, setFormSubType] = useState('Dinh dưỡng & Hạt khô');
  const [formPetType, setFormPetType] = useState<'dog' | 'cat' | 'both'>('both');
  const [formPrice, setFormPrice] = useState(250000);
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formDiscountPercent, setFormDiscountPercent] = useState<number | ''>('');
  const [formStock, setFormStock] = useState(25);
  const [formImage, setFormImage] = useState('/images/prod-ceramic-bowl.jpg');
  const [formPackSize, setFormPackSize] = useState('Chó & Mèo • Tiêu chuẩn');
  const [formFeatured, setFormFeatured] = useState(false);

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stockCount <= 15).length,
    [products]
  );

  const promoCount = useMemo(
    () => products.filter((p) => Boolean(p.discountBadge || p.originalPrice)).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((item) => {
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && item.stockCount <= 15) ||
        (stockFilter === 'in-stock' && item.stockCount > 15) ||
        (stockFilter === 'promo' && Boolean(item.discountBadge || item.originalPrice));
      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const openModal = useCallback((item?: ProductItem) => {
    if (readOnly) return;
    if (item) {
      setIsCreating(false);
      setEditingProduct(item);
      setFormName(item.name);
      setFormBrand(item.brand);
      const safeCat: Exclude<ProductCategory, 'spa'> =
        item.category === 'spa' ? 'hygiene' : item.category;
      setFormCat(safeCat);
      setFormSubType(item.subType);
      setFormPetType(item.petType || 'both');
      setFormPrice(item.priceNum);
      const origStr = item.originalPrice ? item.originalPrice.replace(/\D/g, '') : '';
      setFormOriginalPrice(origStr);
      const origNum = Number(origStr) || 0;
      if (origNum > item.priceNum && item.priceNum > 0) {
        setFormDiscountPercent(Math.round(((origNum - item.priceNum) / origNum) * 100));
      } else {
        setFormDiscountPercent('');
      }
      setFormStock(item.stockCount);
      setFormImage(item.image);
      setFormPackSize(item.packSize);
      setFormFeatured(Boolean(item.isFeatured));
    } else {
      setIsCreating(true);
      setEditingProduct(null);
      setFormName('');
      setFormBrand('PETSFRIEND SELECT');
      setFormCat('food');
      setFormSubType('Dinh dưỡng & Hạt khô');
      setFormPetType('both');
      setFormPrice(250000);
      setFormOriginalPrice('');
      setFormDiscountPercent('');
      setFormStock(25);
      setFormImage('/images/prod-ceramic-bowl.jpg');
      setFormPackSize('Chó & Mèo • Tiêu chuẩn');
      setFormFeatured(false);
    }
  }, [readOnly]);

  const handleApplyDiscountPercent = (pct: number | '') => {
    setFormDiscountPercent(pct);
    if (pct === '' || pct <= 0) {
      setFormOriginalPrice('');
      return;
    }
    let base = Number(formOriginalPrice.replace(/\D/g, '')) || 0;
    if (base <= formPrice) {
      base = formPrice;
      setFormOriginalPrice(base.toString());
    }
    const newPrice = Math.max(1000, Math.round((base * (100 - pct)) / 100000) * 1000);
    setFormPrice(newPrice);
  };

  const handleChangeOriginalPrice = (val: string) => {
    setFormOriginalPrice(val);
    const orig = Number(val.replace(/\D/g, '')) || 0;
    if (orig > formPrice && formPrice > 0) {
      setFormDiscountPercent(Math.round(((orig - formPrice) / orig) * 100));
    } else {
      setFormDiscountPercent('');
    }
  };

  const handleChangePrice = (val: number) => {
    setFormPrice(val);
    const orig = Number(formOriginalPrice.replace(/\D/g, '')) || 0;
    if (orig > val && val > 0) {
      setFormDiscountPercent(Math.round(((orig - val) / orig) * 100));
    } else {
      setFormDiscountPercent('');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onNotify('Vui lòng nhập tên sản phẩm.');
      return;
    }
    const origNum = Number(formOriginalPrice.replace(/\D/g, '')) || 0;
    const hasPromo = origNum > formPrice && formPrice > 0;
    const pct = hasPromo ? Math.round(((origNum - formPrice) / origNum) * 100) : 0;

    const base: ProductItem = editingProduct
      ? { ...editingProduct }
      : {
          id: `prod-custom-${Date.now().toString().slice(-5)}`,
          brand: formBrand.trim() || 'PETSFRIEND SELECT',
          name: formName.trim(),
          shortDesc: 'Sản phẩm chính hãng được phân phối trực tiếp tại PetsFriend Flagship.',
          description:
            'Sản phẩm chọn lọc chuẩn chất lượng PetsFriend, an toàn và phù hợp nhu cầu chăm sóc thú cưng hằng ngày.',
          packSize: formPackSize.trim() || 'Tiêu chuẩn',
          sizes: ['Tiêu chuẩn'],
          rating: 4.9,
          reviewCount: 1,
          priceNum: formPrice,
          price: formatCurrency(formPrice),
          badge: hasPromo ? `ƯU ĐÃI −${pct}%` : 'MỚI NHẬP',
          category: formCat,
          subType: formSubType as ProductItem['subType'],
          petType: formPetType,
          image: formImage.trim() || '/images/prod-ceramic-bowl.jpg',
          gallery: [formImage.trim() || '/images/prod-ceramic-bowl.jpg'],
          bgTone: '#eff5ff',
          stockCount: formStock,
          highlights: ['Chính hãng PetsFriend Flagship', 'Kiểm tra kỹ trước khi giao'],
          soldCount: 0,
          reviews: [],
        };

    const nextItem: ProductItem = {
      ...base,
      name: formName.trim(),
      brand: formBrand.trim().toUpperCase() || 'PETSFRIEND',
      category: formCat,
      subType: formSubType as ProductItem['subType'],
      petType: formPetType,
      priceNum: formPrice,
      price: formatCurrency(formPrice),
      originalPrice: hasPromo ? formatCurrency(origNum) : undefined,
      discountBadge: hasPromo ? `−${pct}%` : undefined,
      isFlashSale: hasPromo,
      badge: hasPromo ? `ƯU ĐÃI −${pct}%` : base.badge,
      stockCount: Math.max(0, formStock),
      image: formImage.trim() || base.image,
      packSize: formPackSize.trim() || base.packSize,
      isFeatured: !hasPromo && formFeatured,
    };

    onSaveProduct(nextItem, isCreating);
    setEditingProduct(null);
    setIsCreating(false);
  };

  const columns = useMemo(() => {
    const allCols = [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Chọn tất cả sản phẩm trang này"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 accent-[#0667d0] rounded cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Chọn ${row.original.name}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 accent-[#0667d0] rounded cursor-pointer"
          />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Sản phẩm & SKU',
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-[240px]">
              <img
                src={item.image}
                alt={item.name}
                className="w-11 h-11 rounded-xl object-cover border border-[#dfe6f0] shrink-0 bg-[#f8faff]"
              />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#17324d] line-clamp-1">
                  {item.name}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#52657a] mt-0.5">
                  <span className="font-mono uppercase">{item.id}</span>
                  <span>·</span>
                  <span>{item.brand}</span>
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('category', {
        header: 'Danh mục',
        cell: (info) => {
          const cat = info.getValue();
          const label = cat === 'spa' ? 'Dịch vụ' : ADMIN_CATEGORY_LABELS[cat];
          return (
            <div>
              <div className="text-[12px] font-semibold text-[#17324d]">{label}</div>
              <div className="text-[11px] text-[#52657a]">{info.row.original.subType}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor('stockCount', {
        header: 'Tồn kho',
        cell: (info) => {
          const count = info.getValue();
          return (
            <span
              className={`font-bold text-[13px] tabular-nums ${
                count <= 15 ? 'text-[#c2410c]' : 'text-[#17324d]'
              }`}
            >
              {count} sp
            </span>
          );
        },
      }),
      columnHelper.accessor('priceNum', {
        header: 'Giá bán',
        cell: (info) => {
          const item = info.row.original;
          return (
            <div className="tabular-nums">
              <div className="text-[13px] font-bold text-[#17324d]">
                {formatCurrency(info.getValue())}
              </div>
              {item.originalPrice && (
                <div className="text-[11px] text-[#52657a] line-through">
                  {item.originalPrice} ({item.discountBadge})
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const item = row.original;
          const isLow = item.stockCount <= 15;
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  isLow
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {isLow ? 'Sắp hết hàng' : 'Còn hàng'}
              </span>
              {item.discountBadge && (
                <span className="px-2 py-0.5 rounded-full bg-[#fff2e9] text-[#c2410c] text-[10px] font-bold">
                  {item.discountBadge}
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openModal(item)}
                title="Chỉnh sửa sản phẩm"
                aria-label={`Chỉnh sửa ${item.name}`}
                className="p-2 rounded-lg border border-[#dfe6f0] hover:border-[#0667d0] hover:bg-[#eff5ff] text-[#17324d] hover:text-[#0667d0] cursor-pointer transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onRequestConfirm({
                    title: 'Xác nhận xóa sản phẩm',
                    message: `Bạn có chắc chắn muốn xóa "${item.name}" khỏi kho PetsFriend?`,
                    confirmLabel: 'Xóa sản phẩm',
                    tone: 'danger',
                    onConfirm: () => onDeleteProduct(item.id),
                  })
                }
                title="Xóa sản phẩm"
                aria-label={`Xóa ${item.name}`}
                className="p-2 rounded-lg border border-[#dfe6f0] hover:border-rose-300 hover:bg-rose-50 text-[#52657a] hover:text-rose-700 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      }),
    ];

    return (readOnly
      ? allCols.filter((c) => c.id !== 'select' && c.id !== 'actions')
      : allCols) as unknown as LegacyColumnDef<ProductItem>[];
  }, [onDeleteProduct, onRequestConfirm, openModal, readOnly]);

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  });

  const handleExportCsv = () => {
    downloadCsvFile(
      'pethub-inventory.csv',
      ['Mã SKU', 'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Loại', 'Giá bán (VND)', 'Tồn kho', 'Khuyến mãi'],
      filteredProducts.map((p) => [
        p.id,
        p.name,
        p.brand,
        p.category === 'spa' ? 'Dịch vụ' : ADMIN_CATEGORY_LABELS[p.category],
        p.subType,
        p.priceNum,
        p.stockCount,
        p.discountBadge || 'Không',
      ])
    );
    onNotify(`Đã xuất ${filteredProducts.length} sản phẩm ra file CSV.`);
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#17324d] tracking-[-0.025em]">
            {readOnly
              ? 'Tra cứu Sản phẩm & Tồn kho'
              : mode === 'stock'
                ? 'Kiểm soát Tồn kho & Cảnh báo'
                : 'Danh mục & Mặt hàng'}
          </h1>
          <p className="text-[13px] text-[#52657a] mt-1">
            {readOnly
              ? 'Chế độ Chỉ xem — Nhân viên tra cứu giá bán và tồn kho, không có quyền thêm/sửa/xóa sản phẩm.'
              : mode === 'stock'
                ? 'Theo dõi số lượng tồn kho, sản phẩm sắp hết (≤ 15) và cập nhật nhập hàng kịp thời.'
                : 'Quản lý danh mục sản phẩm, giá niêm yết và khuyến mãi đồng bộ với Storefront.'}
          </p>
        </div>

        {!readOnly ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#dfe6f0] bg-white hover:bg-[#f8faff] text-[#17324d] text-[13px] font-bold cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Xuất CSV / Excel</span>
            </button>
            <button
              type="button"
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        ) : (
          <span className="px-3.5 py-2 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[12px] font-bold text-[#52657a]">
            Chỉ xem sản phẩm (Staff)
          </span>
        )}
      </div>

      {/* Main Table Card */}
      <div className="w-full max-w-full rounded-2xl bg-white border border-[#dfe6f0] overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] bg-[#f8faff]">
          <div className="relative flex-1 min-w-[220px] max-w-[420px]">
            <Search className="w-4 h-4 text-[#52657a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, mã SKU hoặc hãng..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#dfe6f0] text-[13px] text-[#17324d] focus:outline-none focus:border-[#0667d0]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {mode === 'stock' ? (
              <button
                type="button"
                aria-pressed={stockFilter === 'low'}
                onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                className={`h-10 px-3.5 rounded-xl border text-[13px] font-semibold cursor-pointer transition-colors ${
                  stockFilter === 'low'
                    ? 'bg-[#fff2e9] border-[#fdba74] text-[#c2410c]'
                    : 'bg-white border-[#dfe6f0] text-[#52657a] hover:text-[#17324d]'
                }`}
              >
                Sắp hết hàng ≤ 15 ({lowStockCount})
              </button>
            ) : (
              <button
                type="button"
                aria-pressed={stockFilter === 'promo'}
                onClick={() => setStockFilter(stockFilter === 'promo' ? 'all' : 'promo')}
                className={`h-10 px-3.5 rounded-xl border text-[13px] font-semibold cursor-pointer transition-colors ${
                  stockFilter === 'promo'
                    ? 'bg-[#eff5ff] border-[#0667d0] text-[#0667d0]'
                    : 'bg-white border-[#dfe6f0] text-[#52657a] hover:text-[#17324d]'
                }`}
              >
                Chỉ hàng giảm giá ({promoCount})
              </button>
            )}

            <select
              value={categoryFilter}
              aria-label="Lọc theo danh mục"
              onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
              className="h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-semibold text-[#17324d] focus:outline-none focus:border-[#0667d0] cursor-pointer"
            >
              {(Object.keys(ADMIN_CATEGORY_LABELS) as Array<keyof typeof ADMIN_CATEGORY_LABELS>).map(
                (key) => (
                  <option key={key} value={key}>
                    {ADMIN_CATEGORY_LABELS[key]}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8faff] border-b border-[#eef2f7] text-[11px] font-bold uppercase tracking-wide text-[#52657a]">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 whitespace-nowrap">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-[#17324d] cursor-pointer"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#eef2f7] text-[13px]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#52657a]">
                    Không tìm thấy sản phẩm nào khớp bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#f8faff] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          totalRows={filteredProducts.length}
          pageSize={table.getState().pagination.pageSize}
          itemLabel="sản phẩm"
          onPageChange={(idx) => table.setPageIndex(idx)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </div>

      {/* Add/Edit Modal */}
      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveModal}
            className="w-full max-w-[560px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_24px_60px_rgba(23,50,77,0.2)] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#eef2f7] flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold text-[#17324d]">
                {isCreating ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreating(false);
                }}
                aria-label="Đóng"
                className="w-8 h-8 rounded-lg hover:bg-[#eff5ff] flex items-center justify-center text-[#52657a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
              <div>
                <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px] focus:outline-none focus:border-[#0667d0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Danh mục
                  </label>
                  <select
                    value={formCat}
                    onChange={(e) => {
                      const next = e.target.value as Exclude<ProductCategory, 'spa'>;
                      setFormCat(next);
                      setFormSubType(SUBTYPE_OPTIONS_BY_CAT[next][0]);
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  >
                    <option value="food">Dinh dưỡng &amp; Pate</option>
                    <option value="hygiene">Thuốc &amp; Làm đẹp</option>
                    <option value="bed">Nệm &amp; Lồng chuồng</option>
                    <option value="backpack">Balo &amp; Phụ kiện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Loại chi tiết
                  </label>
                  <select
                    value={formSubType}
                    onChange={(e) => setFormSubType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  >
                    {SUBTYPE_OPTIONS_BY_CAT[formCat].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thiết lập Giá & Khuyến mãi (% tự động) */}
              <div className="rounded-xl p-3 sm:p-3.5 bg-[#f8faff] border border-[#dfe6f0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#17324d] uppercase tracking-wider">
                    Thiết lập Giá &amp; Khuyến mãi
                  </span>
                  {typeof formDiscountPercent === 'number' && formDiscountPercent > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#c2410c] text-white text-[11px] font-bold">
                      Đang giảm −{formDiscountPercent}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                      Giá gốc nếu giảm (₫)
                    </label>
                    <input
                      type="text"
                      placeholder="Bỏ trống nếu giá thường"
                      value={formOriginalPrice}
                      onChange={(e) => handleChangeOriginalPrice(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                      Giá bán thực tế (₫)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      required
                      value={formPrice}
                      onChange={(e) => handleChangePrice(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] tabular-nums font-bold text-[#0667d0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                      Tồn kho
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-white text-[13px] tabular-nums"
                    />
                  </div>
                </div>

                {/* Option chọn nhanh giảm theo % */}
                <div className="pt-2 border-t border-[#dfe6f0]/70">
                  <div className="text-[11.5px] font-semibold text-[#52657a] mb-1.5 flex items-center justify-between">
                    <span>Chọn nhanh % giảm giá (tự động tính tiền):</span>
                    {typeof formDiscountPercent === 'number' && formDiscountPercent > 0 && formOriginalPrice && (
                      <span className="text-emerald-600 font-bold">
                        Tiết kiệm: {(Number(formOriginalPrice.replace(/\D/g, '')) - formPrice).toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: 'Giá gốc (0%)', val: '' as const },
                      { label: '−5%', val: 5 },
                      { label: '−10%', val: 10 },
                      { label: '−15%', val: 15 },
                      { label: '−20%', val: 20 },
                      { label: '−30%', val: 30 },
                      { label: '−50%', val: 50 },
                    ].map((opt) => {
                      const isActive =
                        opt.val === ''
                          ? !formDiscountPercent
                          : formDiscountPercent === opt.val;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleApplyDiscountPercent(opt.val)}
                          className={`px-2.5 py-1 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-[#c2410c] text-white shadow-xs'
                              : 'bg-white border border-[#dfe6f0] text-[#17324d] hover:border-[#c2410c] hover:text-[#c2410c]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                    <div className="inline-flex items-center ml-1 gap-1 text-[12px] font-medium text-[#52657a]">
                      <span>Hoặc nhập:</span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        placeholder="%"
                        value={typeof formDiscountPercent === 'number' ? formDiscountPercent : ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? '' : Number(e.target.value);
                          handleApplyDiscountPercent(typeof v === 'number' ? Math.min(99, Math.max(1, v)) : '');
                        }}
                        className="w-14 h-7 px-1.5 rounded-lg border border-[#dfe6f0] bg-white text-[12px] font-bold text-center"
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Dành cho thú cưng
                  </label>
                  <select
                    value={formPetType}
                    onChange={(e) => setFormPetType(e.target.value as 'dog' | 'cat' | 'both')}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  >
                    <option value="dog">Dành cho Chó</option>
                    <option value="cat">Dành cho Mèo</option>
                    <option value="both">Cả Chó &amp; Mèo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#17324d] mb-1">
                    Đường dẫn ảnh
                  </label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#dfe6f0] bg-[#f8faff] text-[13px]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-[13px] font-semibold text-[#17324d] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#0667d0] rounded"
                />
                <span>Gắn nhãn Sản phẩm nổi bật trên Trang chủ (áp dụng với giá thường)</span>
              </label>
            </div>

            <div className="px-6 py-4 bg-[#f8faff] border-t border-[#eef2f7] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#dfe6f0] bg-white text-[13px] font-bold text-[#17324d] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0667d0] hover:bg-[#0558b5] text-white text-[13px] font-bold cursor-pointer"
              >
                {isCreating ? 'Thêm vào kho' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
