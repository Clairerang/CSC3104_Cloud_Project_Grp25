import React, { useState } from "react";
import { Box, Typography, Card, Checkbox } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { lightGreen } from "@mui/material/colors";

interface ScheduleTask {
  id: string;
  time: string;
  title: string;
  description?: string;
  completed: boolean;
}

const ScheduleScreen: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduleTask[]>([
    {
      id: "1",
      time: "8am",
      title: "Take medication",
      description: "description",
      completed: false,
    },
    {
      id: "2",
      time: "11 am",
      title: "Call Joe",
      completed: false,
    },
    {
      id: "3",
      time: "12 pm",
      title: "Have Lunch with Susan",
      completed: false,
    },
    {
      id: "4",
      time: "2 pm",
      title: "Take medication",
      description: "description",
      completed: false,
    },
  ]);

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 12 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <CalendarMonthIcon sx={{ width: 48, height: 48, color: '#0d9488' }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f766e' }}>
              Schedule
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Today's tasks and activities
            </Typography>
          </Box>
        </Box>

        {/* Activity Invitations Card */}
            <Card sx={{ bgcolor: '#e0f2fe', borderRadius: 4, p: 6, mb: 4}}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
                    Activity Invitations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card sx={{ bgcolor: 'white', borderRadius: 3, p: 4 }}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography sx={{ fontSize: 24 }}>👨‍👩‍👧</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: 20 }}>
                                    Family Lunch - Sunday
                                </Typography>
                            </Box>
                            <Typography sx={{ color: '#6b7280', fontSize: 16 }}>
                                From: Sarah (Daughter) • 12:00 PM at home
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{
                                flex: 1,
                                py: 2,
                                bgcolor: '#16a34a',
                                borderRadius: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#15803d' }
                            }}>
                            <Typography sx={{ fontWeight: 600, color: 'white' }}>Accept</Typography>
                            </Box>
                            <Box sx={{
                                flex: 1,
                                py: 2,
                                bgcolor: '#e5e7eb',
                                borderRadius: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#d1d5db' }
                            }}>
                            <Typography sx={{ fontWeight: 600, color: '#374151' }}>Decline</Typography>
                            </Box>
                        </Box>
                    </Card>
        
                    <Card sx={{ bgcolor: 'white', borderRadius: 3, p: 4 }}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography sx={{ fontSize: 24 }}>🎬</Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: 20 }}>
                                    Movie Night - Friday
                                </Typography>
                            </Box>
                                <Typography sx={{ color: '#6b7280', fontSize: 16 }}>
                                    From: Michael (Son) • 7:00 PM at cinema
                                </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{
                                flex: 1,
                                py: 2,
                                bgcolor: '#16a34a',
                                borderRadius: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#15803d' }
                            }}>
                            <Typography sx={{ fontWeight: 600, color: 'white' }}>Accept</Typography>
                            </Box>
                            <Box sx={{
                                flex: 1,
                                py: 2,
                                bgcolor: '#e5e7eb',
                                borderRadius: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#d1d5db' }
                            }}>
                            <Typography sx={{ fontWeight: 600, color: '#374151' }}>Decline</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Box>
            </Card>

        {/* Schedule Card */}
        <Card sx={{ bgcolor: '#fff2cdff', borderRadius: 4, boxShadow: 1, p: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {tasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 3,
                  p: 3,
                  borderRadius: 3,
                  border: '2px solid #ffffffff',
                  bgcolor: task.completed ? '#ffffffff' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: task.completed ? '#ffffffff' : '#ffffffff',
                  }
                }}
              >
                <Checkbox
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  sx={{
                    p: 0,
                    mt: 0.5,
                    '& .MuiSvgIcon-root': {
                      fontSize: 32,
                    },
                    color: '#d1d5db',
                    '&.Mui-checked': {
                      color: '#16a34a',
                    },
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: '#6b7280',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {task.time}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: '#111827',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      mb: task.description ? 0.5 : 0,
                    }}
                  >
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: '#9ca3af',
                        fontStyle: 'italic',
                      }}
                    >
                      {task.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Summary */}
          <Box sx={{ mt: 6, pt: 4, borderTop: '2px solid #e5e7eb' }}>
            <Typography sx={{ color: '#6b7280', textAlign: 'center' }}>
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default ScheduleScreen;