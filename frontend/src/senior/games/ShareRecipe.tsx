import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface ShareRecipeProps {
  userId: string;
  gameId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function ShareRecipe({ userId, gameId, onComplete, onBack }: ShareRecipeProps) {
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [story, setStory] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Award points directly - simplified approach
  const awardGamePoints = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log(`[GAME-POINTS] Awarding 15 points for recipe sharing completion`);

      const response = await fetch('/api/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'recipe',
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

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async () => {
    if (recipeName && ingredients[0] && instructions) {
      setSubmitted(true);
    }
  };

  const isValid = recipeName.trim() && ingredients[0]?.trim() && instructions.trim();

  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #ffe0b2, #ffffff)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#ff9800', mb: 3 }} />
          <Typography variant="h3" gutterBottom sx={{ color: '#e65100' }}>
            Recipe Shared!
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for sharing "{recipeName}" with the community!
          </Typography>

          <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h3" sx={{ color: '#ff9800', mb: 1 }}>
                +15 Points Earned!
              </Typography>
              <Typography variant="h5" color="text.secondary">
                Your recipe will inspire others to cook and share!
              </Typography>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={awardGamePoints}
              sx={{ minHeight: 40, bgcolor: '#ff9800', fontSize: 20, '&:hover': { bgcolor: '#f57c00' } }}
            >
              Done
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setRecipeName('');
                setServings('');
                setIngredients(['']);
                setInstructions('');
                setStory('');
                setSubmitted(false);
              }}
              sx={{ minHeight: 60 }}
            >
              Share Another Recipe
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '190vh',
        background: 'linear-gradient(to bottom, #ffe0b2, #ffffff)',
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

        <Card sx={{ mb: 3, bgcolor: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" gutterBottom sx={{ color: '#e65100' }}>
                Share a Recipe
              </Typography>
              <Typography variant="h5" color="text.secondary">
                Share your favorite family recipe!
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={3}>
              {/* Recipe Name */}
              <Box>
                <Typography variant="h5" gutterBottom>
                  Recipe Name *
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g., Grandma's Apple Pie"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: 40,
                      fontSize: '1.25rem',
                    },
                  }}
                />
              </Box>

              {/* Servings */}
              <Box>
                <Typography variant="h5" gutterBottom>
                  Servings
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g., 4-6 people"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: 40,
                      fontSize: '1.25rem',
                    },
                  }}
                />
              </Box>

              {/* Ingredients */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">Ingredients *</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddIngredient}
                    variant="outlined"
                    size="large"
                  >
                    Add Ingredient
                  </Button>
                </Box>
                <Stack spacing={2}>
                  {ingredients.map((ingredient, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        placeholder={`Ingredient ${index + 1}`}
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            minHeight: 40,
                            fontSize: '1.25rem',
                          },
                        }}
                      />
                      {ingredients.length > 1 && (
                        <Button
                          onClick={() => handleRemoveIngredient(index)}
                          variant="outlined"
                          color="error"
                          sx={{ minWidth: 40 }}
                        >
                          <DeleteIcon />
                        </Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Instructions */}
              <Box>
                <Typography variant="h5" gutterBottom>
                  Instructions *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Describe how to make your recipe step by step..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '1.25rem',
                    },
                  }}
                />
              </Box>

              {/* Story (Optional) */}
              <Box>
                <Typography variant="h5" gutterBottom>
                  Recipe Story (Optional)
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: 20 }}>
                  Where did this recipe come from? What memories does it bring?
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Share the story behind this recipe..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '1.25rem',
                    },
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {!isValid && (
          <Card sx={{ mb: 3, bgcolor: '#fff3e0', border: 2, borderColor: '#ffb74d' }}>
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                ℹ️ Please fill in all required fields (*) to share your recipe
              </Typography>
            </CardContent>
          </Card>
        )}

        <Stack spacing={2}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={!isValid}
            sx={{
              minHeight: 50,
              bgcolor: '#ff9800',
              '&:hover': { bgcolor: '#f57c00' },
              '&:disabled': {
                bgcolor: '#e0e0e0',
              },
            }}
          >
            <Typography variant="h5" sx={{ color: 'white' }}>
              Share Recipe
            </Typography>
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={onBack}
            sx={{ minHeight: 40 }}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
