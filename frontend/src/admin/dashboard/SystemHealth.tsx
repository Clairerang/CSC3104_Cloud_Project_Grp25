import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';
import { api } from '../services/api';
import { ServiceHealth } from '../../types/index';

const SystemHealth: React.FC = () => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServicesHealth();
    const interval = setInterval(checkServicesHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkServicesHealth = async () => {
    try {
      const response = await api.health.getAllServices();

      // Transform backend response to frontend format
      const transformedServices: ServiceHealth[] = response.data.services.map((service: any) => ({
        id: service.id,
        name: service.id,
        displayName: service.name,
        status: service.status,
        uptime: service.uptime,
        responseTime: typeof service.responseTime === 'string'
          ? parseInt(service.responseTime) || 0
          : service.responseTime,
        lastChecked: service.lastChecked,
        endpoint: service.endpoint,
      }));

      setServices(transformedServices);
      setLoading(false);
    } catch (error) {
      console.error('Error loading service health:', error);
      // Fallback to empty array on error
      setServices([]);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />;
      case 'degraded':
        return <Warning fontSize="small" sx={{ color: 'warning.main' }} />;
      case 'offline':
        return <Error fontSize="small" sx={{ color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  const onlineServices = services.filter((s) => s.status === 'online').length;
  const totalServices = services.length;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600">
          System Health
        </Typography>
        <Chip
          label={`${onlineServices}/${totalServices} Services Online`}
          color={onlineServices === totalServices ? 'success' : 'warning'}
          size="small"
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Uptime</TableCell>
              <TableCell align="right">Response Time</TableCell>
              <TableCell>Last Checked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.name} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(service.status)}
                    <Typography variant="body2">{service.displayName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={service.status}
                    color={getStatusColor(service.status) as any}
                    size="small"
                    sx={{ minWidth: 80 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="500">
                    {service.uptime}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{service.responseTime}ms</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(service.lastChecked).toLocaleTimeString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SystemHealth;