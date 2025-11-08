import { Box, Chip, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export default function SlaIndicator({ request }) {
  if (!request.dueDate) {
    return null;
  }

  const now = new Date();
  const dueDate = new Date(request.dueDate);
  const hoursRemaining = (dueDate - now) / (1000 * 60 * 60);

  let status = 'ok';
  let color = 'success';
  let icon = <CheckCircleIcon />;
  let label = 'SLA İçinde';

  if (request.completedAt) {
    const completedAt = new Date(request.completedAt);
    if (completedAt > dueDate) {
      status = 'violated';
      color = 'error';
      icon = <ErrorIcon />;
      label = 'SLA İhlali';
    } else {
      status = 'completed';
      color = 'success';
      icon = <CheckCircleIcon />;
      label = 'Zamanında Tamamlandı';
    }
  } else if (hoursRemaining < 0) {
    status = 'overdue';
    color = 'error';
    icon = <ErrorIcon />;
    label = `${Math.abs(hoursRemaining).toFixed(0)} saat gecikmiş`;
  } else if (hoursRemaining < 24) {
    status = 'warning';
    color = 'warning';
    icon = <WarningIcon />;
    label = `${hoursRemaining.toFixed(0)} saat kaldı`;
  } else {
    label = `${(hoursRemaining / 24).toFixed(0)} gün kaldı`;
  }

  const tooltipText = `Son Tarih: ${dueDate.toLocaleString('tr-TR')}`;

  return (
    <Tooltip title={tooltipText}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant={status === 'completed' ? 'outlined' : 'filled'}
      />
    </Tooltip>
  );
}

