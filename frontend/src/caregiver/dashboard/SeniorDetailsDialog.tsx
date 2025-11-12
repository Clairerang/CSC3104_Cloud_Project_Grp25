import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import { Phone, VideoCall, Favorite, Groups, EmojiEmotions } from '@mui/icons-material';
import { caregiverApi } from '../api/client';
import { CaregiverSeniorCard } from '../types/caregiver';
import SeniorDetailsHeader from './SeniorDetailsHeader';
import SeniorInfoCard from './SeniorInfoCard';
import RecentActivityList from './RecentActivityList';
import DialingModal from './DialingModal';

interface SeniorDetailsDialogProps {
  senior: CaregiverSeniorCard | null;
  open: boolean;
  onClose: () => void;
}

const SeniorDetailsDialog: React.FC<SeniorDetailsDialogProps> = ({ senior, open, onClose }) => {
  const [dialingOpen, setDialingOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [relations, setRelations] = useState<Array<{ id: string; name: string; relation: string; contact?: string }>>([]);
  const [relationsLoading, setRelationsLoading] = useState(false);
  const [relationsError, setRelationsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !senior) {
      setRelations([]);
      setRelationsError(null);
      return;
    }

    let cancelled = false;

    const loadRelations = async () => {
      setRelationsLoading(true);
      setRelationsError(null);
      try {
        const response = await caregiverApi.getSeniorRelations(senior.userId);
        if (cancelled) return;

        const mapped = response.relations
          .filter((relation) => relation.familyUser)
          .map((relation) => ({
            id: relation.familyUser!.userId,
            name: relation.familyUser!.profile?.name || relation.familyUser!.username,
            contact: relation.familyUser!.profile?.contact,
            relation: relation.relation,
          }));

        setRelations(mapped);
      } catch (error) {
        console.error('Error loading senior relations:', error);
        if (!cancelled) {
          setRelationsError('Unable to load family members.');
          setRelations([]);
        }
      } finally {
        if (!cancelled) {
          setRelationsLoading(false);
        }
      }
    };

    loadRelations();

    return () => {
      cancelled = true;
    };
  }, [open, senior]);

  const handleVideoCall = () => {
    setCallType('video');
    setDialingOpen(true);
  };

  const handleVoiceCall = () => { 
    setCallType('voice');
    setDialingOpen(true);
  };

  const handleCloseDialing = () => {
    setDialingOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <SeniorDetailsHeader senior={senior} />
      <DialogContent>
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            <SeniorInfoCard
              icon={<EmojiEmotions />}
              title="Latest Mood"
              content={
                senior?.latestMood
                  ? senior.latestMood === 'great'
                    ? 'Great'
                    : senior.latestMood === 'okay'
                      ? 'Okay'
                      : 'Not feeling well'
                  : 'No mood recorded today'
              }
              iconColor="#ff9800"
            />
            <SeniorInfoCard
              icon={<Favorite />}
              title="Total Points"
              content={senior ? `${senior.totalPoints} pts earned` : 'No points yet'}
              iconColor="#f44336"
            />
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups fontSize="small" /> Care Team
            </Typography>
            {relationsLoading ? (
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Loading linked family members...
              </Typography>
            ) : relationsError ? (
              <Typography variant="body2" sx={{ color: '#f44336' }}>
                {relationsError}
              </Typography>
            ) : relations.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                No linked family members found.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {relations.map((relation) => (
                  <Chip
                    key={relation.id}
                    label={`${relation.name} • ${relation.relation}`}
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>

          {senior && (
            <RecentActivityList
              senior={senior}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="contained"
          startIcon={<VideoCall />}
          sx={{ flex: 1 }}
          onClick={handleVideoCall}
        >
          Video Call
        </Button>
        <Button
          variant="contained"
          startIcon={<Phone />}
          sx={{ flex: 1 }}
          onClick={handleVoiceCall}
        >
          Call Now
        </Button>
      </DialogActions>

      {/* Dialing Modal */}
      <DialingModal
        open={dialingOpen}
        onClose={handleCloseDialing}
        senior={senior}
        callType={callType}
      />
    </Dialog>
  );
};

export default SeniorDetailsDialog;

