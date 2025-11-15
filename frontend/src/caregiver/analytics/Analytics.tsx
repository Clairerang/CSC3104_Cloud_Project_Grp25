import {
    CheckCircle,
    Phone,
    Schedule,
    TrendingUp,
} from '@mui/icons-material';
import {
    Box,
    Card,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Alert as MuiAlert,
    Select,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import caregiverApi, { AnalyticsDataPoint } from '../api/client';

interface Senior {
  id: string;
  name: string;
  initials: string;
  engagement: number;
}

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [selectedSenior, setSelectedSenior] = useState('all');
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [weeklyData, setWeeklyData] = useState<AnalyticsDataPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<AnalyticsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const analyticsResponse = await caregiverApi.getAnalytics();
        
        const seniorsList = analyticsResponse.seniors.map(s => ({
          id: s.seniorId,
          name: s.name,
          initials: s.initials,
          engagement: s.engagement,
        }));
        
        setSeniors(seniorsList);
        setWeeklyData(analyticsResponse.weeklyData);
        setMonthlyData(analyticsResponse.monthlyData);
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const seniorComparisonData = seniors.map(senior => ({
    name: senior.name,
    engagement: senior.engagement,
  }));

  const isAllSeniors = selectedSenior === 'all';
  const selectedSeniorData = seniors.find(s => s.id === selectedSenior);
  
  const data = timeframe === 'weekly' ? weeklyData : monthlyData;

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return '#4caf50';
    if (engagement >= 50) return '#ff9800';
    return '#f44336';
  };

  // Calculate overall stats from data
  const overallStats = {
    checkIns: data.reduce((sum, d) => sum + d.checkIns, 0),
    calls: data.reduce((sum, d) => sum + d.calls, 0),
    tasks: data.reduce((sum, d) => sum + d.tasks, 0),
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 6 }}>
        <MuiAlert severity="error">{error}</MuiAlert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f9fafb' }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
            Analytics & Insights
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Track engagement and care patterns for your loved ones
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 3, mb: 6, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Senior</InputLabel>
            <Select
              value={selectedSenior}
              onChange={(e) => setSelectedSenior(e.target.value)}
              label="Select Senior"
            >
              <MenuItem value="all">All Seniors</MenuItem>
              {seniors.map((senior) => (
                <MenuItem key={senior.id} value={senior.id}>
                  {senior.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Senior Profile Card */}
        {!isAllSeniors && selectedSeniorData && (
          <Card
            sx={{
              p: 4,
              mb: 6,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 100%)',
              border: '1px solid #bbdefb',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#1976d2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 20,
                }}
              >
                {selectedSeniorData.initials}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {selectedSeniorData.name}
                </Typography>
                <Typography sx={{ color: '#6b7280' }}>
                  Individual Profile Analytics
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white', px: 3, py: 2, borderRadius: 2, border: '1px solid #bbdefb' }}>
                <TrendingUp sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Engagement Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {selectedSeniorData.engagement}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        )}

        {/* Main Chart */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            {isAllSeniors ? 'Overall Engagement Trends' : `${selectedSeniorData?.name}'s Engagement Trends`}
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey={timeframe === 'weekly' ? 'week' : 'month'} 
                stroke="#6b7280"
                style={{ fontSize: '14px', fontWeight: '500' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '14px', fontWeight: '500' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="checkIns" 
                fill="#2563EB" 
                radius={[8, 8, 0, 0]} 
                name="Check-ins"
                maxBarSize={60}
              />
              <Bar 
                dataKey="calls" 
                fill="#22C55E" 
                radius={[8, 8, 0, 0]} 
                name="Calls"
                maxBarSize={60}
              />
              <Bar 
                dataKey="tasks" 
                fill="#FACC15" 
                radius={[8, 8, 0, 0]} 
                name="Tasks"
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Comparison Chart */}
        {isAllSeniors && seniors.length > 0 && (
          <Card sx={{ p: 4, mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Senior Engagement Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seniorComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
                <Bar 
                  dataKey="engagement" 
                  fill="#2563EB" 
                  radius={[8, 8, 0, 0]} 
                  name="Engagement Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Card sx={{ p: 4, bgcolor: '#e3f2fd', border: '1px solid #bbdefb' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ p: 1, bgcolor: '#1976d2', borderRadius: 1 }}>
                <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                {isAllSeniors ? 'Total' : ''} Check-ins
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
              {overallStats.checkIns}
            </Typography>
          </Card>

          <Card sx={{ p: 4, bgcolor: '#e8f5e8', border: '1px solid #c8e6c9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ p: 1, bgcolor: '#4caf50', borderRadius: 1 }}>
                <Phone sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                {isAllSeniors ? 'Total' : ''} Calls
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
              {overallStats.calls}
            </Typography>
          </Card>

          <Card sx={{ p: 4, bgcolor: '#fff8e1', border: '1px solid #ffecb3' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ p: 1, bgcolor: '#ff9800', borderRadius: 1 }}>
                <Schedule sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 600, color: '#ff9800' }}>
                Tasks Completed
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
              {overallStats.tasks}
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Analytics;
