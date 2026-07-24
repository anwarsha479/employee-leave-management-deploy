import { flexRender, type Table as ReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { useRef } from "react";

interface InfiniteScrollTableProps<TData> {
  table: ReactTable<TData>;
  loading: boolean;
  hasMore: boolean;
  pageSize: number;
  page: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
  emptyMessage?: string;
  loadingMessage?: string;
  maxHeight?: number;
}

export function InfiniteScrollTable<TData>({
  table,
  loading,
  hasMore,
  pageSize,
  page,
  totalCount,
  onPageChange,
  onLoadMore,
  emptyMessage = "No items found.",
  loadingMessage = "Loading items...",
  maxHeight = 520,
}: InfiniteScrollTableProps<TData>) {
  // Use references to prevent stale closures in the async scroll listener
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const pageSizeRef = useRef(pageSize);
  const rowsCountRef = useRef(table.getRowModel().rows.length);

  // Keep references updated for the scroll handler scope
  loadingRef.current = loading;
  hasMoreRef.current = hasMore;
  pageSizeRef.current = pageSize;
  rowsCountRef.current = table.getRowModel().rows.length;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight,
          overflow: "auto",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "8px",
          backgroundColor: "background.paper",
          boxShadow: "none",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255,255,255,0.01)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.1)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(255,255,255,0.2)",
          },
        }}
        onScroll={(e) => {
          const target = e.currentTarget;
          const nearBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight < 100;

          // Request next chunk if scrolled near bottom, not currently loading, and limit has not been met
          if (
            nearBottom &&
            !loadingRef.current &&
            hasMoreRef.current &&
            rowsCountRef.current < pageSizeRef.current
          ) {
            onLoadMore();
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableCell
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#18181b",
                        borderBottom: "2px solid rgba(255,255,255,0.08)",
                        cursor: canSort ? "pointer" : "default",
                        userSelect: "none",
                        "&:hover": canSort
                          ? {
                              backgroundColor: "rgba(255, 255, 255, 0.03)",
                            }
                          : {},
                        transition: "background-color 0.15s",
                        textAlign: header.id === "actions" ? "center" : "left",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            header.id === "actions" ? "center" : "flex-start",
                          gap: 0.5,
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                        {canSort && (
                          <Box
                            sx={{
                              display: "inline-flex",
                              color: "primary.light",
                            }}
                          >
                            {isSorted === "asc" && " ▴"}
                            {isSorted === "desc" && " ▾"}
                            {!isSorted && (
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                  opacity: 0.2,
                                  fontSize: "0.7rem",
                                  ml: 0.5,
                                }}
                              >
                                ↕
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.02) !important",
                  },
                  transition: "background-color 0.15s ease-in-out",
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    sx={{
                      textAlign:
                        cell.column.id === "actions" ? "center" : "left",
                      color:
                        cell.column.id === "actions"
                          ? "inherit"
                          : "text.secondary",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {table.getRowModel().rows.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={
                    table.getAllLeafColumns().filter((c) => c.getIsVisible())
                      .length
                  }
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Loading Indicator */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 3,
            gap: 2,
          }}
        >
          <CircularProgress size={22} thickness={5} />
          <Typography variant="body2" color="text.secondary">
            {loadingMessage}
          </Typography>
        </Box>
      )}

      {/* Pages loaded summary */}
      {!hasMore && table.getRowModel().rows.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 0.5 }}
          >
            Page {page} loaded (showing {table.getRowModel().rows.length} items)
          </Typography>
        </Box>
      )}

      {/* Pagination Page navigation controls */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => onPageChange(val)}
            color="primary"
          />
        </Box>
      )}
    </>
  );
}
