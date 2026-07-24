import { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
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
import EmployeeForm from "../components/EmployeeForm";
import { InfiniteScrollTable } from "../components/InfiniteScrollTable";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employee.service";

import { getDepartments } from "../services/department.service";

const columnLabels: Record<string, string> = {
  employeeCode: "Code",
  name: "Name",
  email: "Email",
  phone: "Phone",
  designation: "Designation",
  department: "Department",
  joiningDate: "Joining Date",
  actions: "Actions",
};

function EmployeesPage() {
  const [employees, _setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [, _setOffset] = useState(0);
  const [hasMore, _setHasMore] = useState(true);
  const [loading, _setLoading] = useState(false);
  // States for hybrid scroll-based pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      try {
        const stored = localStorage.getItem("lms_employee_columns_visibility");
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
  const employeesRef = useRef<any[]>([]);
  const offsetRef = useRef(0); // Tracks scroll offset loaded inside the active page
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const pageSizeRef = useRef(10);
  const debouncedSearchRef = useRef("");
  const sortingRef = useRef<SortingState>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pageRef = useRef(1); // Synchronizes active page index for scroll operations

  // Helper state & ref sync setters
  const setEmployeesState = (data: any[]) => {
    employeesRef.current = data;
    _setEmployees(data);
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
      "lms_employee_columns_visibility",
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

  const fetchEmployees = async (reset = false) => {
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
      const currentEmployees = reset ? [] : employeesRef.current;
      const currentSearch = debouncedSearchRef.current;
      const currentSorting = sortingRef.current;

      const remaining = currentPageSize - currentEmployees.length;
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

      const response = await getEmployees(
        currentSearch,
        currentPageSize,
        baseOffset + currentOffsetInsidePage,
        chunkToFetch,
        sortBy,
        sortOrder,
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return;

      const newEmployees = response.data?.data || [];
      const responseHasMore = response.data?.hasMore ?? false;
      const responseTotal = response.data?.total ?? 0;

      setTotalCount(responseTotal);

      if (newEmployees.length === 0) {
        setHasMoreState(false);
        if (reset) {
          setEmployeesState([]);
        }
        return;
      }

      let updatedEmployees;
      if (reset) {
        updatedEmployees = newEmployees;
      } else {
        const existingIds = new Set(currentEmployees.map((emp) => emp.id));
        const filteredNew = newEmployees.filter(
          (emp: any) => !existingIds.has(emp.id),
        );
        updatedEmployees = [...currentEmployees, ...filteredNew];
      }

      setEmployeesState(updatedEmployees);
      setOffsetState(currentOffsetInsidePage + newEmployees.length);

      // Stop scrolling if we reached the selected page size limit or backend has no more records
      const reachedPageSize = updatedEmployees.length >= currentPageSize;
      setHasMoreState(responseHasMore && !reachedPageSize);
    } catch (error: any) {
      if (
        error.name === "CanceledError" ||
        error.name === "AbortError" ||
        error.message === "canceled"
      ) {
        console.log("Fetch call aborted");
      } else {
        console.error("Error fetching employees:", error);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoadingState(false);
      }
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments("");
      setDepartments(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
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
    setEmployeesState([]);
    setOffsetState(0);
    setHasMoreState(true);
    fetchEmployees(true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearch, pageSize, page, sorting]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const loadMore = () => {
    if (!loadingRef.current && hasMoreRef.current) {
      fetchEmployees(false);
    }
  };

  const handleCreateEmployee = async (employee: any) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employee);
        setEditingEmployee(null);
      } else {
        await createEmployee(employee);
      }

      setEmployeesState([]);
      setOffsetState(0);
      setHasMoreState(true);
      fetchEmployees(true);
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );
    if (!confirmed) return;

    try {
      await deleteEmployee(id);

      setEmployeesState([]);
      setOffsetState(0);
      setHasMoreState(true);
      fetchEmployees(true);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee({
      ...employee,
      departmentId: employee.department?.id,
    });
    setFormOpen(true);
  };

  // TanStack columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Code",
        enableSorting: true,
      },
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        cell: (info: any) => (
          <Typography
            sx={{
              fontWeight: 600,
              color: "primary.light",
              fontSize: "inherit",
            }}
          >
            {info.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        enableSorting: true,
      },
      {
        accessorKey: "designation",
        header: "Designation",
        enableSorting: true,
      },
      {
        accessorKey: "department",
        header: "Department",
        enableSorting: true,
        cell: (info: any) => info.row.original.department?.name || "",
      },
      {
        accessorKey: "joiningDate",
        header: "Joining Date",
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false, // Prevents actions column from being hidden
        cell: (info: any) => (
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
              color="warning"
              size="small"
              onClick={() => handleEditEmployee(info.row.original)}
              sx={{ borderRadius: "6px" }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDeleteEmployee(info.row.original.id)}
              sx={{ borderRadius: "6px" }}
            >
              Delete
            </Button>
          </Box>
        ),
      },
    ],
    [editingEmployee],
  );

  const table = useReactTable({
    data: employees,
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
              Employees
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and view employee directory logs.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingEmployee(null);
              setFormOpen(true);
            }}
          >
            Add Employee
          </Button>
        </Box>

        <EmployeeForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingEmployee(null);
          }}
          onSubmit={handleCreateEmployee}
          employee={editingEmployee}
          departments={departments}
        />

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
                  placeholder="Search employees..."
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
              emptyMessage="No employees found."
              loadingMessage="Loading employees..."
            />
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default EmployeesPage;
