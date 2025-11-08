import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Phone,
  CheckCircle,
  Schedule,
  Favorite,
  Medication,
} from '@mui/icons-material';
import { mockApi, Senior, AnalyticsData, OverallAnalyticsStats } from '../api/mockData';

const Analytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [selectedSenior, setSelectedSenior] = useState('all');
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [overallStats, setOverallStats] = useState<OverallAnalyticsStats | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [seniorsData, analyticsDataResponse, overallStatsData] = await Promise.all([
          mockApi.getSeniors(),
          mockApi.getAnalyticsData(),
          mockApi.getOverallAnalyticsStats(),
        ]);
        setSeniors(seniorsData);
        setAnalyticsData(analyticsDataResponse);
        setOverallStats(overallStatsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };

    loadData();
  }, []);

  const seniorComparisonData = seniors.map(senior => ({
    name: senior.name,
    engagement: senior.engagement,
  }));

  const isAllSeniors = selectedSenior === 'all';
  const seniorData = !isAllSeniors && analyticsData ? analyticsData.seniorDataMap[selectedSenior] : null;
  
  const data = isAllSeniors 
    ? (timeframe === 'weekly' ? analyticsData?.weeklyData : analyticsData?.monthlyData)
    : (timeframe === 'weekly' ? seniorData?.weeklyData : seniorData?.monthlyData);

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return '#4caf50';
    if (engagement >= 50) return '#ff9800';
    return '#f44336';
  };

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
              {seniors.map((senior) => {
                const key = senior.name.toLowerCase().replace(/\s+/g, '-');
                return (
                  <MenuItem key={senior.id} value={key}>
                    {senior.name}
                  </MenuItem>
                );
              })}
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
        {!isAllSeniors && seniorData && (
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
                {seniorData.initials}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {seniorData.name}
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
                    {seniorData.stats.engagement}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        )}

        {/* Main Chart */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            {isAllSeniors ? 'Overall Engagement Trends' : `${seniorData?.name}'s Engagement Trends`}
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

        {/* Comparison or Activity Distribution */}
        {isAllSeniors ? (
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
        ) : (
          seniorData && (
            <Card sx={{ p: 4, mb: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Activity Time Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {seniorData.activityBreakdown.map((item, index) => (
                  <Box key={item.name} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600, color: item.color }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ fontWeight: 600, color: item.color }}>
                        {item.value}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 32,
                        bgcolor: '#f3f4f6',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${item.value}%`,
                          bgcolor: item.color,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          pr: 2,
                          transition: 'width 0.5s ease',
                        }}
                      >
                        <Typography sx={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
                          {item.value}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          )
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
          <Card sx={{ p: 4, bgcolor: '#e3f2fd', border: '1px solid #bbdefb' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ p: 1, bgcolor: '#1976d2', borderRadius: 1 }}>
                <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 600, color: '#1976d2' }}>
                {isAllSeniors ? 'Total' : ''} Check-ins
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
              {isAllSeniors ? overallStats?.checkIns : seniorData?.stats.checkIns}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#1976d2' }}>
              {isAllSeniors ? overallStats?.checkInsChange : ''}
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
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
              {isAllSeniors ? overallStats?.calls : seniorData?.stats.calls}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#4caf50' }}>
              {isAllSeniors ? overallStats?.callsChange : ''}
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
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
              {isAllSeniors ? overallStats?.tasks : seniorData?.stats.tasks}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#ff9800' }}>
              {isAllSeniors ? overallStats?.tasksChange : ''}
            </Typography>
          </Card>
        </Box>

        {/* Recent Activity Highlights */}
        {!isAllSeniors && seniorData && (
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Activity Highlights
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb' }}>
                <CheckCircle sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                    Most Active Time
                  </Typography>
                  <Typography sx={{ color: '#6b7280' }}>
                    {seniorData.activityBreakdown.reduce((max, item) => item.value > max.value ? item : max).name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#e8f5e8', borderRadius: 2, border: '1px solid #c8e6c9' }}>
                <TrendingUp sx={{ color: '#4caf50' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                    Engagement Trend
                  </Typography>
                  <Typography sx={{ color: '#6b7280' }}>
                    {seniorData.stats.engagement >= 80 ? 'Excellent and consistent' : 
                     seniorData.stats.engagement >= 50 ? 'Good with room for improvement' : 
                     'Needs attention and support'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffecb3' }}>
                <Phone sx={{ color: '#ff9800' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                    Communication Preference
                  </Typography>
                  <Typography sx={{ color: '#6b7280' }}>
                    {seniorData.communicationPreference || 'Not specified'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Analytics;
