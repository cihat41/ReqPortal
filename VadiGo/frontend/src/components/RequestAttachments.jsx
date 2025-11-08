import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  AttachFile as AttachIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import api from '../services/api';

export default function RequestAttachments({ requestId, canUpload = true }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [requestId]);

  const loadAttachments = async () => {
    try {
      const response = await api.get(`/attachments/request/${requestId}`);
      setAttachments(response.data);
    } catch (error) {
      console.error('Dosyalar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post(`/attachments/upload/${requestId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      loadAttachments();
    } catch (error) {
      console.error('Dosya yüklenemedi:', error);
      alert('Dosya yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachmentId, fileName) => {
    try {
      const response = await api.get(`/attachments/download/${attachmentId}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Dosya indirilemedi:', error);
      alert('Dosya indirilemedi');
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/attachments/${attachmentId}`);
      loadAttachments();
    } catch (error) {
      console.error('Dosya silinemedi:', error);
      alert('Dosya silinemedi');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Ekler ({attachments.length})
          </Typography>
          {canUpload && (
            <Button
              variant="outlined"
              component="label"
              startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
              disabled={uploading}
            >
              Dosya Ekle
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </Button>
          )}
        </Box>

        {attachments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <AttachIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography>Henüz dosya eklenmemiş</Typography>
          </Box>
        ) : (
          <List>
            {attachments.map((attachment, index) => (
              <ListItem
                key={attachment.id}
                divider={index < attachments.length - 1}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleDownload(attachment.id, attachment.fileName)}
                    >
                      <DownloadIcon />
                    </IconButton>
                    {canUpload && (
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDelete(attachment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <ListItemIcon>
                  <AttachIcon />
                </ListItemIcon>
                <ListItemText
                  primary={attachment.fileName}
                  secondary={
                    <>
                      {formatFileSize(attachment.fileSize)} • 
                      {' '}{new Date(attachment.uploadedAt).toLocaleString('tr-TR')}
                      {attachment.uploadedBy && (
                        <> • {attachment.uploadedBy.firstName} {attachment.uploadedBy.lastName}</>
                      )}
                    </>
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

