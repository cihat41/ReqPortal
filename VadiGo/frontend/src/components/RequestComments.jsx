import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../services/api';

export default function RequestComments({ requestId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [requestId]);

  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/request/${requestId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/comments', {
        requestId,
        comment: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Yorum eklenemedi:', error);
      alert('Yorum eklenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Yorum silinemedi:', error);
      alert('Yorum silinemedi');
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Yorumlar ({comments.length})
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Yorum ekleyin..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              endIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
              disabled={!newComment.trim() || submitting}
            >
              Gönder
            </Button>
          </Box>
        </Box>

        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <Typography>Henüz yorum yapılmamış</Typography>
          </Box>
        ) : (
          <List>
            {comments.map((comment, index) => (
              <ListItem
                key={comment.id}
                alignItems="flex-start"
                divider={index < comments.length - 1}
                secondaryAction={
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(comment.id)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getInitials(comment.user.firstName, comment.user.lastName)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {comment.user.firstName} {comment.user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleString('tr-TR')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                    >
                      {comment.comment}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

