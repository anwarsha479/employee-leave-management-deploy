import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface LeaveFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (leave: any) => void;
  employees: any[];
}

function LeaveForm({ open, onClose, onSubmit }: LeaveFormProps) {
  const [startDate, setStartDate] = useState("");
  const [leaveType, setLeaveType] = useState("CASUAL");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [startDateError, setStartDateError] = useState("");

  const [endDateError, setEndDateError] = useState("");

  const [reasonError, setReasonError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setStartDateError("");
    setEndDateError("");
    setReasonError("");

    let hasError = false;

    if (!startDate) {
      setStartDateError("Start date is required");
      hasError = true;
    }

    if (!endDate) {
      setEndDateError("End date is required");
      hasError = true;
    }
    const today = new Date().toISOString().split("T")[0];

    if (startDate && startDate < today) {
      setStartDateError("Cannot apply leave for past dates");
      hasError = true;
    }
    if (startDate && endDate && endDate < startDate) {
      setEndDateError("End date cannot be before start date");
      hasError = true;
    }

    if (!reason.trim()) {
      setReasonError("Reason is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    onSubmit({
      leaveType,
      startDate,
      endDate,
      reason,
    });

    setLeaveType("CASUAL");
    setStartDate("");
    setEndDate("");
    setReason("");
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
          Apply for Leave
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
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>

              <Select
                value={leaveType}
                label="Leave Type"
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <MenuItem value="CASUAL">Casual Leave</MenuItem>

                <MenuItem value="SICK">Sick Leave</MenuItem>

                <MenuItem value="WORK_FROM_HOME">Work From Home</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);

                if (e.target.value) {
                  setStartDateError("");
                }
              }}
              fullWidth
              error={!!startDateError}
              helperText={startDateError}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                htmlInput: {
                  min: new Date().toISOString().split("T")[0],
                },
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);

                if (e.target.value) {
                  setEndDateError("");
                }
              }}
              fullWidth
              error={!!endDateError}
              helperText={endDateError}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                htmlInput: {
                  min: startDate || new Date().toISOString().split("T")[0],
                },
              }}
            />
            <TextField
              label="Reason for Leave"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);

                if (e.target.value.trim()) {
                  setReasonError("");
                }
              }}
              fullWidth
              multiline
              rows={4}
              error={!!reasonError}
              helperText={reasonError}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit Leave Request
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LeaveForm;
