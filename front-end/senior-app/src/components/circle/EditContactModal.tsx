import React, { useState, useEffect } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import type { Contact } from "../../types";

interface Props {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

const EditContactModal: React.FC<Props> = ({ open, contact, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    number: "",
    isFavorite: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    number: "",
  });

  // Populate form when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        relationship: contact.relationship,
        number: contact.number,
        isFavorite: contact.isFavorite ?? false,
      });
    }
  }, [contact]);

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
      number: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.number.trim()) {
      newErrors.number = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.number)) {
      newErrors.number = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.number;
  };

  const handleSave = () => {
    if (!contact) return;

    if (validateForm()) {
      const nameParts = formData.name.trim().split(" ");
      const initials =
        nameParts.length > 1
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : nameParts[0].slice(0, 2).toUpperCase();

      const updatedContact: Contact = {
        ...contact,
        name: formData.name.trim(),
        relationship: formData.relationship.trim() || "Contact",
        number: formData.number.trim(),
        initials,
        isFavorite: formData.isFavorite,
      };

      onSave(updatedContact);
      handleClose();
    }
  };

  const handleClose = () => {
    setErrors({
      name: "",
      number: "",
    });
    onClose();
  };

  const handleDelete = () => {
    if (!contact) return;
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      onDelete(contact);
      handleClose();
    }
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
            Edit Contact
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
            value={formData.number}
            onChange={(e) => handleChange("number", e.target.value)}
            error={!!errors.number}
            helperText={errors.number}
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

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleDelete}
          variant="outlined"
          startIcon={<DeleteIcon />}
          sx={{
            textTransform: "none",
            fontSize: 16,
            px: 4,
            py: 1.5,
            bgcolor: "#dc2626",
            color: '#fff',
            "&:hover": { bgcolor: "#c80000ff" },
            borderRadius: 2,
          }}
        >
          Delete Contact
        </Button>
        {/* <Button
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
        </Button> */}
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
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContactModal;