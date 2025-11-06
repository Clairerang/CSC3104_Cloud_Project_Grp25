import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  TablePagination,
  Grid
} from '@mui/material';
import {
  Visibility,
  Search,
  Add,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import { api } from '../services/api';
import { User } from '../types';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const response = await api.users.getAll();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      // Mock data if API fails
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Mary Johnson',
          email: 'mary.j@email.com',
          role: 'senior',
          status: 'active',
          createdAt: '2024-01-15',
          lastActive: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: '2',
          name: 'Robert Chen',
          email: 'robert.c@email.com',
          role: 'senior',
          status: 'active',
          createdAt: '2024-02-20',
          lastActive: new Date(Date.now() - 5 * 3600000).toISOString(),
        },
        {
          id: '3',
          name: 'Sarah Williams',
          email: 'sarah.w@email.com',
          role: 'family',
          status: 'active',
          createdAt: '2024-01-10',
          lastActive: new Date(Date.now() - 1 * 3600000).toISOString(),
        },
        {
          id: '4',
          name: 'John Davis',
          email: 'john.d@email.com',
          role: 'senior',
          status: 'active',
          createdAt: '2024-03-05',
          lastActive: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
        {
          id: '5',
          name: 'Linda Martinez',
          email: 'linda.m@email.com',
          role: 'family',
          status: 'active',
          createdAt: '2024-02-14',
          lastActive: new Date(Date.now() - 3 * 3600000).toISOString(),
        },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'senior':
        return 'primary';
      case 'family':
        return 'secondary';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            User Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage seniors, families, and admin users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/users/new')}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={roleFilter}
                label="Filter by Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="senior">Seniors</MenuItem>
                <MenuItem value="family">Families</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
              <Chip label={`${filteredUsers.length} Users`} color="primary" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>{formatLastActive(user.lastActive)}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default UserList;