import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import DepartmentForm from "../components/DepartmentForm";
import Layout from "../components/Layout";

import {
  getDepartments,
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from "../services/department.service";

function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments(search);
      setDepartments(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  const handleCreateDepartment = async (name: string, description: string) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, { name, description });
        setEditingDepartment(null);
      } else {
        await createDepartment({ name, description });
      }
      fetchDepartments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?",
    );
    if (!confirmed) return;

    try {
      await deleteDepartment(id);
      fetchDepartments();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
      sortable: true,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 300,
      sortable: true,
      renderCell: (params) => params.value,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: any) => (
        <Box
          sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}
        >
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => {
              setEditingDepartment(params.row);
              setFormOpen(true);
            }}
            sx={{ py: 0.5 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDeleteDepartment(params.row.id)}
            sx={{ py: 0.5 }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

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
              Departments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage organization departments and structures.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingDepartment(null);
              setFormOpen(true);
            }}
          >
            Add Department
          </Button>
        </Box>

        <DepartmentForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingDepartment(null);
          }}
          onSubmit={handleCreateDepartment}
          department={editingDepartment}
        />

        <Card sx={{ maxWidth: "100%", overflow: "hidden" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <TextField
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ maxWidth: 320 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <DataGrid
                rows={departments}
                columns={columns}
                autoHeight
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10 },
                  },
                }}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    whiteSpace: "normal !important",
                    lineHeight: "normal",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default DepartmentsPage;
