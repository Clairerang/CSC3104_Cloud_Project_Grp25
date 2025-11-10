import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Contact } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, "id">) => void;
}

const CreateNewContactModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    isFavorite: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      phoneNumber: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phoneNumber;
  };

  const handleSave = () => {
    if (validateForm()) {
      const nameParts = formData.name.trim().split(" ");
      const initials =
        nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : nameParts[0].slice(0, 2).toUpperCase();

      const newContact: Omit<Contact, "id"> = {
        name: formData.name.trim(),
        relationship: formData.relationship.trim() || "Contact",
        phoneNumber: formData.phoneNumber.trim(),
        initials,
        lastCall: "Never",
        isFavorite: formData.isFavorite,
      };

      onSave(newContact);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      relationship: "",
      phoneNumber: "",
      isFavorite: false,
    });
    setErrors({
      name: "",
      phoneNumber: "",
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Create New Contact
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
          {/* Name Field */}
          <TextField
            label="Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="e.g., John Smith"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: 18,
              },
            }}
          />

          {/* Relationship Field */}
          <TextField
            label="Relationship"
            fullWidth
            value={formData.relationship}
            onChange={(e) => handleChange("relationship", e.target.value)}
            placeholder="e.g., Son, Daughter, Friend"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: 18,
              },
            }}
          />

          {/* Phone Number Field */}
          <TextField
            label="Phone Number"
            fullWidth
            required
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            placeholder="e.g., +1 234 567 8900"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: 18,
              },
            }}
          />

          {/* Favorite Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isFavorite}
                onChange={(e) => handleChange("isFavorite", e.target.checked)}
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 28,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 18 }}>
                Add to favorites
              </Typography>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontSize: 16,
            px: 4,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            textTransform: "none",
            fontSize: 16,
            px: 4,
            py: 1.5,
            bgcolor: "#3b82f6",
            "&:hover": { bgcolor: "#2563eb" },
            borderRadius: 2,
          }}
        >
          Save Contact
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateNewContactModal;