import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Storage,
  Memory,
  Speed,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api';
import { ServiceHealth, SystemMetrics } from '../../types/index';

const ServiceMonitor: React.FC = () => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, metricsRes] = await Promise.all([
        api.system.getAllServices(),
        api.system.getMetrics(),
      ]);

      // Transform services data and filter out HiveMQ
      const transformedServices: ServiceHealth[] = servicesRes.data.services
        .filter((service: any) =>
          !service.id?.toLowerCase().includes('hivemq') &&
          !service.name?.toLowerCase().includes('hivemq')
        )
        .map((service: any) => ({
          id: service.id,
          name: service.id,
          displayName: service.name,
          status: service.status,
          uptime: service.uptime,
          responseTime: typeof service.responseTime === 'string'
            ? parseInt(service.responseTime.replace('ms', '').replace('< ', '')) || 0
            : service.responseTime,
          lastChecked: service.lastChecked,
          endpoint: service.endpoint,
          version: service.details?.version || 'N/A',
        }));

      setServices(transformedServices);

      // Transform metrics data
      const avgResponseTime = transformedServices
        .filter(s => s.responseTime > 0)
        .reduce((sum, s) => sum + (s.responseTime as number), 0) /
        (transformedServices.filter(s => s.responseTime > 0).length || 1);

      setMetrics({
        cpu: 0, // Not available from backend yet
        memory: 0, // Will be parsed from backend response
        disk: 0,
        activeConnections: 0,
        requestsPerMinute: 0,
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: 0,
      });
    } catch (error) {
      console.error('Error fetching service data:', error);
      setServices([]);
      setMetrics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const performanceData = [
    { time: '10:00', cpu: 30, memory: 58 },
    { time: '10:15', cpu: 35, memory: 60 },
    { time: '10:30', cpu: 32, memory: 59 },
    { time: '10:45', cpu: 38, memory: 62 },
    { time: '11:00', cpu: 35, memory: 62 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'degraded':
        return <Warning sx={{ color: 'warning.main' }} />;
      case 'offline':
        return <Error sx={{ color: 'error.main' }} />;
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const onlineServices = services.filter((s) => s.status === 'online').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Service Monitor
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time monitoring of all microservices
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* System Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Services Online
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {onlineServices}/{services.length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {metrics?.averageResponseTime}ms
                  </Typography>
                </Box>
                <Speed sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    CPU Usage
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {metrics?.cpu}%
                  </Typography>
                </Box>
                <Memory sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Memory Usage
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {metrics?.memory}%
                  </Typography>
                </Box>
                <Storage sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          System Performance (Last Hour)
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cpu" stroke="#ed6c02" name="CPU %" />
            <Line type="monotone" dataKey="memory" stroke="#1976d2" name="Memory %" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Services Table */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="600">
            Service Status
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Version</TableCell>
                <TableCell align="right">Uptime</TableCell>
                <TableCell align="right">Response Time</TableCell>
                <TableCell>Endpoint</TableCell>
                <TableCell>Last Checked</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.name} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(service.status)}
                      <Typography variant="body2" fontWeight="500">
                        {service.displayName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.status}
                      color={getStatusColor(service.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={service.version} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="500">
                      {service.uptime}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{service.responseTime}ms</TableCell>
                  <TableCell>
                    <Typography variant="caption" color="textSecondary">
                      {service.endpoint}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(service.lastChecked).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ServiceMonitor;