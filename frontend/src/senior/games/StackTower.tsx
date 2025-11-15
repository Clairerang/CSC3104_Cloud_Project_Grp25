import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface StackTowerProps {
  userId: string;
  gameId: string;
  onComplete: () => void;
  onBack: () => void;
}

interface Block {
  x: number;
  width: number;
  color: string;
}

export function StackTower({ userId, gameId, onComplete, onBack }: StackTowerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed' | 'failed'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [movingBlock, setMovingBlock] = useState<Block | null>(null);
  const [direction, setDirection] = useState(1);
  const [speed, setSpeed] = useState(2);
  const animationFrameRef = useRef<number | null>(null);

  // Award points directly - simplified approach
  const awardGamePoints = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log(`[GAME-POINTS] Awarding 15 points for stack tower completion`);

      const response = await fetch('/api/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'tower',
          points: 15,
          session: 'afternoon'
        })
      });

      if (response.ok) {
        console.log(`[GAME-POINTS] Points awarded successfully`);
      } else {
        console.error('[GAME-POINTS] Failed to award points');
      }
    } catch (error) {
      console.error('[GAME-POINTS] Error awarding points:', error);
    } finally {
      onComplete();
    }
  };

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 550;
  const BLOCK_HEIGHT = 30;
  const INITIAL_WIDTH = 100;

  const colors = [
    '#9c27b0',
    '#673ab7',
    '#673ab7',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#f44336',
    '#e91e63',
  ];

  const startGame = () => {
    const initialBlock: Block = {
      x: CANVAS_WIDTH / 2 - INITIAL_WIDTH / 2,
      width: INITIAL_WIDTH,
      color: colors[0],
    };
    setBlocks([initialBlock]);
    setMovingBlock({
      x: 0,
      width: INITIAL_WIDTH,
      color: colors[1],
    });
    setScore(0);
    setDirection(1);
    setSpeed(2);
    setGameState('playing');
  };

  const placeBlock = () => {
    if (!movingBlock || blocks.length === 0) return;

    const lastBlock = blocks[blocks.length - 1];
    const overlap = calculateOverlap(lastBlock, movingBlock);

    if (overlap <= 0) {
      // Game over - no overlap
      setGameState('failed');
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    // Calculate new block position and width
    const newX = Math.max(lastBlock.x, movingBlock.x);
    const newWidth = overlap;

    const newBlock: Block = {
      x: newX,
      width: newWidth,
      color: colors[(blocks.length + 1) % colors.length],
    };

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setScore(newBlocks.length - 1);

    // Check if player reached 5 blocks (win condition)
    if (newBlocks.length >= 16) {
      setGameState('completed');
      if (score > highScore) {
        setHighScore(score + 1);
      }
      return;
    }

    // Create next moving block
    setMovingBlock({
      x: direction > 0 ? 0 : CANVAS_WIDTH - newWidth,
      width: newWidth,
      color: colors[(blocks.length + 2) % colors.length],
    });

    // Increase difficulty
    setSpeed((prev) => Math.min(prev + 0.2, 8));
  };

  const calculateOverlap = (block1: Block, block2: Block): number => {
    const left = Math.max(block1.x, block2.x);
    const right = Math.min(block1.x + block1.width, block2.x + block2.width);
    return Math.max(0, right - left);
  };

  useEffect(() => {
    if (gameState !== 'playing' || !movingBlock) return;

    const animate = () => {
      setMovingBlock((prev) => {
        if (!prev) return null;

        let newX = prev.x + speed * direction;

        // Bounce off walls
        if (newX <= 0) {
          newX = 0;
          setDirection(1);
        } else if (newX + prev.width >= CANVAS_WIDTH) {
          newX = CANVAS_WIDTH - prev.width;
          setDirection(-1);
        }

        return { ...prev, x: newX };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, speed, direction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#e3f2fd';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw blocks from bottom to top
    const visibleBlocks = blocks.slice(-15); // Show last 15 blocks
    visibleBlocks.forEach((block, index) => {
      const y = CANVAS_HEIGHT - (index + 1) * BLOCK_HEIGHT - 10; // -10 for ground height
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, y, block.width, BLOCK_HEIGHT);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x, y, block.width, BLOCK_HEIGHT);
    });

    // Draw moving block above the tower
    if (movingBlock && gameState === 'playing') {
      const y = CANVAS_HEIGHT - (visibleBlocks.length + 1) * BLOCK_HEIGHT - 10; // -10 for ground height
      ctx.fillStyle = movingBlock.color;
      ctx.fillRect(movingBlock.x, y, movingBlock.width, BLOCK_HEIGHT);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(movingBlock.x, y, movingBlock.width, BLOCK_HEIGHT);
    }

    // Draw ground
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);
  }, [blocks, movingBlock, gameState]);

  if (gameState === 'menu') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #b8d7f9ff, #ffffffff)',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            size="large"
            sx={{ mb: 3, minHeight: 50 }}
          >
            Back to Activities
          </Button>

            <Card sx={{ mb: 3, bgcolor: '#e2effdff' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" gutterBottom sx={{ color: '#105bacff' }}>
                  Stack Tower
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Stack blocks as high as you can!
                </Typography>
              </Box>
            </CardContent>
          </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                <Typography variant="h5" gutterBottom>
                    How to Play:
                </Typography>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '2rem' }}>1️⃣</Typography>
                    <Typography variant="h5">Tap to drop the moving block</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '2rem' }}>2️⃣</Typography>
                    <Typography variant="h5">Try to stack blocks perfectly on top of each other</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '2rem' }}>3️⃣</Typography>
                    <Typography variant="h5">Misaligned parts will be cut off</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '2rem' }}>4️⃣</Typography>
                    <Typography variant="h5">Reach 5 blocks to win!</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '2rem' }}>5️⃣</Typography>
                    <Typography variant="h5">Game ends if blocks dont overlap</Typography>
                    </Box>
                </Stack>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                {highScore > 0 && (
                <Card sx={{ bgcolor: '#c8e6c9', border: 2, borderColor: '#66bb6a' }}>
                    <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <EmojiEventsIcon sx={{ fontSize: 48, color: '#f9a825' }} />
                        <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '20px' }}>
                            High Score
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                            {highScore} blocks
                        </Typography>
                        </Box>
                    </Box>
                    </CardContent>
                </Card>
                )}
            </Card>

            <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={startGame}
                startIcon={<PlayArrowIcon sx={{ fontSize: '40px !important' }} />}
                sx={{
                minHeight: 40,
                bgcolor: '#2769b0ff',
                '&:hover': { bgcolor: '#1f4fa2ff' },
                }}
            >
                <Typography variant="h5" sx={{ color: 'white' }}>
                Start Game
                </Typography>
            </Button>
        </Box>
      </Box>
    );
  }

  if (gameState === 'completed') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #b8d7f9ff, #ffffffff)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
                  <Typography variant="h3" gutterBottom sx={{ color: '#1976d2' }}>
                    Tower Complete!
                  </Typography>
                  <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                    Amazing! You stacked {score} blocks! 🎉
                  </Typography>
        
                  <Card sx={{ mb: 3, bgcolor: '#d1e7ffff' }}>
                    <CardContent>
                      <Typography variant="h3" sx={{ color: '#3389ebff', mb: 1 }}>
                        +15 Points Earned!
                      </Typography>
                      <Typography variant="h5" color="text.secondary">
                        Some incredible skills you have!
                      </Typography>
                    </CardContent>
                  </Card>
        
                  <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={awardGamePoints}
                        sx={{ minHeight: 70, bgcolor: '#2088ffff', fontSize: 20, '&:hover': { bgcolor: '#0077ffff' } }}
                    >
                        Done
                    </Button>

                    <Button
                        onClick={startGame}
                        variant="outlined"
                        size="large"
                        sx={{ minHeight: 60 }}
                    >
                        Play Again
                    </Button>
                  </Stack>
          </Box>
      </Box>
    );
  }

  if (gameState === 'failed') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #b8d7f9ff, #ffffffff)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >

        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
            <Chip
              label={`High Score: ${highScore}`}
              sx={{
                fontSize: '1.25rem',
                height: 48,
                bgcolor: '#2088ffff',
                color: 'white',
                // fontWeight: 600,
                px: 2,
                mb: 10,
                ml: 53
              }}
            />
                  <Typography variant="h3" gutterBottom sx={{ color: '#f44336' }}>
                    Tower Collapsed!
                  </Typography>
                  <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                    Keep practicing to build higher!
                  </Typography>
        
                  <Card sx={{ mb: 3, bgcolor: '#d1e7ffff' }}>
                    <CardContent>
                      <Typography variant="h3" sx={{ color: '#3389ebff', mb: 1 }}>
                        +15 Points Earned!
                      </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: 20 }}>
                        You reached {score} blocks!
                        </Typography>
                    </CardContent>
                  </Card>
        
                  <Stack spacing={2} sx={{ width: '100%', mt: 3 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={awardGamePoints}
                        sx={{ minHeight: 70, bgcolor: '#2088ffff', fontSize: 20, '&:hover': { bgcolor: '#0077ffff' } }}
                    >
                        Done
                    </Button>

                    <Button
                        onClick={startGame}
                        variant="outlined"
                        size="large"
                        sx={{ minHeight: 60 }}
                    >
                        Play Again
                    </Button>
                  </Stack>
          </Box>
      </Box>
    );
  }

  // Playing state
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #b8d7f9ff, #ffffffff)',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Chip
              label={`Score: ${score}`}
              sx={{
                fontSize: '1.25rem',
                height: 48,
                bgcolor: '#2088ffff',
                color: 'white',
                fontWeight: 600,
                px: 2,
                ml: 83,
              }}
            />
          </Box>

          <Card sx={{ width: '100%', bgcolor: '#fff9c4', border: 2, borderColor: '#fdd835' }}>
            <CardContent>
              <Typography variant="body1" textAlign="center" color="text.secondary" pt="" >
                Tap "Drop Block" to place the moving block. Stack 5 blocks to win!
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ p: 2, bgcolor: 'white', width: '100%', maxWidth: 440 }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                border: '4px solid #1976d2',
                borderRadius: '8px',
                display: 'block',
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
              }}
            />
          </Card>

          <Button
            onClick={placeBlock}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 4,
              maxWidth: 440,
              minHeight: 60,
              bgcolor: '#63a4ffff',
              '&:hover': { bgcolor: '#387ad6ff' },
            }}
          >
            <Typography variant="body1" sx={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              Drop Block
            </Typography>
          </Button>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={onBack}
            sx={{ minHeight: 60, maxWidth: 440 }}
          >
            Exit Game
          </Button>

        </Stack>
      </Box>
    </Box>
  );
}