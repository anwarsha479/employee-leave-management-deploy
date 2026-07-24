import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (employee: any) => void;
  employee?: any;
  departments: any[];
}

function EmployeeForm({
  open,
  onClose,
  onSubmit,
  employee,
  departments,
}: EmployeeFormProps) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeCodeError, setEmployeeCodeError] = useState("");

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [designation, setDesignation] = useState("");
  const [designationError, setDesignationError] = useState("");

  const [departmentId, setDepartmentId] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  const [joiningDate, setJoiningDate] = useState("");
  const [joiningDateError, setJoiningDateError] = useState("");

  useEffect(() => {
    if (employee) {
      setEmployeeCode(employee.employeeCode || "");
      setName(employee.name || "");
      setEmail(employee.email || "");
      setPhone(employee.phone || "");
      setDesignation(employee.designation || "");
      setDepartmentId(employee.departmentId || "");
      setJoiningDate(employee.joiningDate || "");
    } else {
      setEmployeeCode("");
      setName("");
      setEmail("");
      setPhone("");
      setDesignation("");
      setDepartmentId("");
      setJoiningDate("");
    }
  }, [employee, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setEmployeeCodeError("");
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setDesignationError("");
    setDepartmentError("");
    setJoiningDateError("");

    let hasError = false;

    if (!employeeCode.trim()) {
      setEmployeeCodeError("Employee code is required");
      hasError = true;
    }

    if (!name.trim()) {
      setNameError("Name is required");
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Invalid email format");
      hasError = true;
    }

    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      hasError = true;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Phone number must be 10 digits");
      hasError = true;
    }

    if (!designation.trim()) {
      setDesignationError("Designation is required");
      hasError = true;
    }

    if (!departmentId) {
      setDepartmentError("Department is required");
      hasError = true;
    }

    if (!joiningDate) {
      setJoiningDateError("Joining date is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    onSubmit({
      employeeCode,
      name,
      email,
      phone,
      designation,
      departmentId,
      joiningDate,
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="span" sx={{ fontWeight: 750 }}>
          {employee ? "Edit Employee Details" : "Create New Employee"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Employee Code"
              value={employeeCode}
              onChange={(e) => {
                setEmployeeCode(e.target.value);

                if (e.target.value.trim()) {
                  setEmployeeCodeError("");
                }
              }}
              fullWidth
              error={!!employeeCodeError}
              helperText={employeeCodeError}
            />

            <TextField
              label="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);

                if (e.target.value.trim()) {
                  setNameError("");
                }
              }}
              fullWidth
              error={!!nameError}
              helperText={nameError}
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);

                if (!value.trim()) {
                  setEmailError("Email is required");
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  setEmailError("Invalid email format");
                } else {
                  setEmailError("");
                }
              }}
              fullWidth
              error={!!emailError}
              helperText={emailError}
            />

            <TextField
              label="Phone"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;

                if (/^\d*$/.test(value)) {
                  setPhone(value);

                  if (value && value.length !== 10) {
                    setPhoneError("Phone number must be 10 digits");
                  } else {
                    setPhoneError("");
                  }
                }
              }}
              fullWidth
              error={!!phoneError}
              helperText={phoneError}
            />

            <TextField
              label="Designation"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);

                if (e.target.value.trim()) {
                  setDesignationError("");
                }
              }}
              fullWidth
              error={!!designationError}
              helperText={designationError}
            />

            <TextField
              select
              label="Department"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);

                if (e.target.value) {
                  setDepartmentError("");
                }
              }}
              fullWidth
              error={!!departmentError}
              helperText={departmentError}
            >
              <MenuItem value="">
                <em>Select Department</em>
              </MenuItem>

              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Joining Date"
              type="date"
              value={joiningDate}
              onChange={(e) => {
                setJoiningDate(e.target.value);

                if (e.target.value) {
                  setJoiningDateError("");
                }
              }}
              fullWidth
              error={!!joiningDateError}
              helperText={joiningDateError}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {employee ? "Update Employee" : "Save Employee"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EmployeeForm;
