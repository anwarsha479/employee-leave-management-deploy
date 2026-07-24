import { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  useReactTable,
  getCoreRowModel,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import Layout from "../components/Layout";
import { InfiniteScrollTable } from "../components/InfiniteScrollTable";
import LeaveForm from "../components/LeaveForm";
import {
  getLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  exportLeaves,
} from "../services/leave.service";

import { getEmployees } from "../services/employee.service";

const columnLabels: Record<string, string> = {
  employee: "Employee",
  startDate: "Start Date",
  endDate: "End Date",
  reason: "Reason",
  status: "Status",
  actions: "Actions",
};

function LeavesPage() {
  const [leaves, _setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [, _setOffset] = useState(0);
  const [hasMore, _setHasMore] = useState(true);
  const [loading, _setLoading] = useState(false);
  // States for hybrid scroll-based pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { user } = useAuth();
  const role = user?.role;
  if (!user) {
    return null;
  }
  const [searchParams] = useSearchParams();

  const statusFromUrl = searchParams.get("status") || "";

  const [status, setStatus] = useState(statusFromUrl);

  useEffect(() => {
    setStatus(statusFromUrl);
  }, [statusFromUrl]);

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      try {
        const stored = localStorage.getItem("lms_leave_columns_visibility");
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    },
  );

  // Columns menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Refs to prevent stale closures in async/scroll handlers
  const leavesRef = useRef<any[]>([]);
  const offsetRef = useRef(0); // Tracks scroll offset loaded inside the active page
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const pageSizeRef = useRef(10);
  const debouncedSearchRef = useRef("");
  const sortingRef = useRef<SortingState>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pageRef = useRef(1); // Synchronizes active page index for scroll operations

  // Helper state & ref sync setters
  const setLeavesState = (data: any[]) => {
    leavesRef.current = data;
    _setLeaves(data);
  };
  const setOffsetState = (val: number) => {
    offsetRef.current = val;
    _setOffset(val);
  };
  const setHasMoreState = (val: boolean) => {
    hasMoreRef.current = val;
    _setHasMore(val);
  };
  const setLoadingState = (val: boolean) => {
    loadingRef.current = val;
    _setLoading(val);
  };

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  useEffect(() => {
    debouncedSearchRef.current = debouncedSearch;
  }, [debouncedSearch]);

  useEffect(() => {
    sortingRef.current = sorting;
  }, [sorting]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // Persist column visibility
  useEffect(() => {
    localStorage.setItem(
      "lms_leave_columns_visibility",
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchLeaves = async (reset = false) => {
    // If scrolling and already loading, do nothing
    if (loadingRef.current && !reset) return;

    // Abort active request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoadingState(true);

      const currentPage = pageRef.current;
      const currentPageSize = pageSizeRef.current;
      const baseOffset = (currentPage - 1) * currentPageSize;

      const currentOffsetInsidePage = reset ? 0 : offsetRef.current;
      const currentLeaves = reset ? [] : leavesRef.current;
      const currentSearch = debouncedSearchRef.current;
      const currentSorting = sortingRef.current;

      const remaining = currentPageSize - currentLeaves.length;
      if (remaining <= 0) {
        setHasMoreState(false);
        setLoadingState(false);
        return;
      }

      // Fetch at most 'remaining' items or 10, whichever is smaller
      const chunkToFetch = Math.min(10, remaining);

      // Extract sorting parameter
      const sort = currentSorting[0];
      const sortBy = sort ? sort.id : "";
      const sortOrder = sort ? (sort.desc ? "DESC" : "ASC") : "";

      const response = await getLeaves(
        currentSearch,
        currentPageSize,
        baseOffset + currentOffsetInsidePage,
        chunkToFetch,
        sortBy,
        sortOrder,
        status,
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      const newLeaves = response.data?.data || [];
      const responseHasMore = response.data?.hasMore ?? false;
      const responseTotal = response.data?.total ?? 0;

      setTotalCount(responseTotal);

      if (newLeaves.length === 0) {
        setHasMoreState(false);
        if (reset) {
          setLeavesState([]);
        }
        return;
      }

      let updatedLeaves;
      if (reset) {
        updatedLeaves = newLeaves;
      } else {
        const existingIds = new Set(currentLeaves.map((l) => l.id));
        const filteredNew = newLeaves.filter(
          (l: any) => !existingIds.has(l.id),
        );
        updatedLeaves = [...currentLeaves, ...filteredNew];
      }

      setLeavesState(updatedLeaves);
      setOffsetState(currentOffsetInsidePage + newLeaves.length);

      // Stop scrolling if we reached the selected page size limit or backend has no more records
      const reachedPageSize = updatedLeaves.length >= currentPageSize;
      setHasMoreState(responseHasMore && !reachedPageSize);
    } catch (error: any) {
      if (
        error.name === "CanceledError" ||
        error.name === "AbortError" ||
        error.message === "canceled"
      ) {
        console.log("Fetch call aborted");
      } else {
        console.error("Error fetching leaves:", error);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoadingState(false);
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees("", 1000, 0, 1000);
      setEmployees(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleCreateLeave = async (leave: any) => {
    try {
      await createLeave(leave);
      setFormOpen(false);
      setLeavesState([]);
      setOffsetState(0);
      setHasMoreState(true);
      fetchLeaves(true);
    } catch (error) {
      console.error("Error creating leave request:", error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveLeave(id);
      setLeavesState([]);
      setOffsetState(0);
      setHasMoreState(true);
      fetchLeaves(true);
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectLeave(id);
      setLeavesState([]);
      setOffsetState(0);
      setHasMoreState(true);
      fetchLeaves(true);
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  // Keep track of previous dependencies to detect what changed
  const prevDeps = useRef({ debouncedSearch, pageSize, sorting });

  // Resets infinite scroll offset state and loads data when filters, sorting, or pages change
  useEffect(() => {
    const searchChanged = prevDeps.current.debouncedSearch !== debouncedSearch;
    const pageSizeChanged = prevDeps.current.pageSize !== pageSize;
    const sortingChanged = prevDeps.current.sorting !== sorting;

    prevDeps.current = { debouncedSearch, pageSize, sorting };

    // Reset back to page 1 if query filters change (setPage will trigger a reload)
    if (searchChanged || pageSizeChanged || sortingChanged) {
      if (page !== 1) {
        setPage(1);
        return; // Avoid double load: let the page state trigger handle the next run
      }
    }

    // Reset parameters and load initial chunk for the current page
    setLeavesState([]);
    setOffsetState(0);
    setHasMoreState(true);
    fetchLeaves(true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearch, pageSize, page, sorting, status]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const loadMore = () => {
    if (!loadingRef.current && hasMoreRef.current) {
      fetchLeaves(false);
    }
  };
  const handleExport = async () => {
    try {
      const response = await exportLeaves();

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "leave-requests.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  // TanStack columns definition
  const columns = useMemo(() => {
    const cols: any[] = [
      {
        accessorKey: "employee",
        header: "Employee",
        enableSorting: true,
        cell: (info: any) => info.row.original.employee?.name || "",
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        enableSorting: true,
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        enableSorting: true,
      },
      {
        accessorKey: "reason",
        header: "Reason",
        enableSorting: true,
        cell: (info: any) => (
          <Typography
            sx={{
              whiteSpace: "normal",
              lineHeight: 1.4,
              py: 1,
              fontSize: "inherit",
            }}
          >
            {info.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: (info: any) => {
          const status = info.getValue();
          let color: "success" | "error" | "warning" = "warning";
          if (status === "APPROVED") color = "success";
          if (status === "REJECTED") color = "error";

          return (
            <Chip
              label={status}
              color={color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
    ];

    if (role === "ADMIN") {
      cols.push({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false, // Prevents actions column from being hidden
        cell: (info: any) => {
          const status = info.row.original.status;
          if (status !== "PENDING") return null;

          return (
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant="outlined"
                color="success"
                size="small"
                onClick={() => handleApprove(info.row.original.id)}
                sx={{ borderRadius: "6px" }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleReject(info.row.original.id)}
                sx={{ borderRadius: "6px" }}
              >
                Reject
              </Button>
            </Box>
          );
        },
      });
    }

    return cols;
  }, [role]);

  const table = useReactTable({
    data: leaves,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, // Server-side sorting
  });

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Leave Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Apply and manage leave requests.
            </Typography>
          </Box>

          {role === "EMPLOYEE" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
            >
              Apply Leave
            </Button>
          )}
          {role === "ADMIN" && (
            <Button variant="outlined" onClick={handleExport}>
              Export Excel
            </Button>
          )}
        </Box>

        {role === "EMPLOYEE" && (
          <LeaveForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleCreateLeave}
            employees={employees}
          />
        )}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2, flexGrow: 1, maxWidth: 500 }}>
                <TextField
                  placeholder="Search leaves by employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  sx={{ width: 320 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  variant="outlined"
                  startIcon={<ViewColumnIcon />}
                  onClick={handleOpenMenu}
                  sx={{ borderRadius: "8px", textTransform: "none" }}
                >
                  Columns
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleCloseMenu}
                  slotProps={{
                    paper: {
                      sx: {
                        maxHeight: 400,
                        width: "220px",
                        p: 1,
                        backgroundImage: "none",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      },
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ px: 2, py: 1, fontWeight: 700 }}
                  >
                    Toggle Columns
                  </Typography>
                  {table.getAllLeafColumns().map((column) => {
                    const isActions = column.id === "actions";
                    return (
                      <MenuItem
                        key={column.id}
                        disabled={isActions}
                        sx={{ py: 0.5 }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={column.getIsVisible()}
                              onChange={column.getToggleVisibilityHandler()}
                              disabled={isActions}
                              size="small"
                            />
                          }
                          label={columnLabels[column.id] || column.id}
                          sx={{ width: "100%", m: 0 }}
                        />
                      </MenuItem>
                    );
                  })}
                </Menu>
              </Box>

              <FormControl size="small" sx={{ width: 150 }}>
                <InputLabel id="page-size-select-label">Page Size</InputLabel>
                <Select
                  labelId="page-size-select-label"
                  value={pageSize}
                  label="Page Size"
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <InfiniteScrollTable
              table={table}
              loading={loading}
              hasMore={hasMore}
              pageSize={pageSize}
              page={page}
              totalCount={totalCount}
              onPageChange={setPage}
              onLoadMore={loadMore}
              emptyMessage="No leave requests found."
              loadingMessage="Loading leaves..."
            />
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default LeavesPage;
