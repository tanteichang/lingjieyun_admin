import type { PageInfo, PaginationProps } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

type FetcherPayload<TQuery extends Record<string, any>> = TQuery & {
  page?: number;
  limit?: number;
};

export interface CommonTableFetcherResult<TRow> {
  list: TRow[];
  total: number;
}

export interface UseCommonTableOptions<TQuery extends Record<string, any>, TRow> {
  /** 请求函数，返回列表数据与总数 */
  fetcher: (params: FetcherPayload<TQuery>) => Promise<CommonTableFetcherResult<TRow>>;
  /** 查询初始值 */
  defaultQuery: TQuery;
  /** 分页初始值 */
  defaultPagination?: Partial<PaginationProps>;
  /** 是否自动触发首次查询（默认 false，交由表单触发） */
  autoSearch?: boolean;
  /** 请求防抖时间，单位 ms（默认 300ms） */
  debounceWait?: number;
}

const createDebounce = <T extends (...args: any[]) => void>(fn: T, wait: number): T => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, wait);
  }) as T;
};

export const useCommonTable = <TQuery extends Record<string, any>, TRow>(
  options: UseCommonTableOptions<TQuery, TRow>,
) => {
  const loading = ref(false);
  const data = ref<TRow[]>([]);
  const debounceWait = options.debounceWait ?? 300;
  const initialQuery = JSON.parse(JSON.stringify(options.defaultQuery || {})) as TQuery;
  const query = reactive<TQuery>({ ...initialQuery });
  const pagination = reactive<PaginationProps>({
    current: options.defaultPagination?.current ?? 1,
    pageSize: options.defaultPagination?.pageSize ?? 20,
    total: options.defaultPagination?.total ?? 0,
    pageSizeOptions: options.defaultPagination?.pageSizeOptions ?? [20, 50, 100],
    showJumper: options.defaultPagination?.showJumper ?? false,
    showPageSize: options.defaultPagination?.showPageSize ?? true,
    totalContent: options.defaultPagination?.totalContent ?? true,
    ...options.defaultPagination,
  });

  const runFetcher = async () => {
    loading.value = true;
    try {
      const { list, total } = await options.fetcher({
        ...query,
        page: pagination.current,
        limit: pagination.pageSize,
      } as FetcherPayload<TQuery>);
      data.value = list;
      pagination.total = total || 0;
    } catch (error) {
      console.error('useCommonTable fetch error:', error);
    } finally {
      loading.value = false;
    }
  };

  const triggerFetch = debounceWait ? createDebounce(runFetcher, debounceWait) : runFetcher;

  const search = (payload?: Partial<TQuery>) => {
    if (payload) {
      Object.assign(query, payload);
    }
    pagination.current = 1;
    triggerFetch();
  };

  const reset = () => {
    Object.assign(query, initialQuery);
    pagination.current = 1;
    triggerFetch();
  };

  const handlePageChange = (pageInfo: PageInfo) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    triggerFetch();
  };

  const refresh = () => triggerFetch();

  onMounted(() => {
    if (options.autoSearch) {
      triggerFetch();
    }
  });

  return {
    data,
    loading,
    pagination,
    query,
    search,
    reset,
    refresh,
    handlePageChange,
  };
};
