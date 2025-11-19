import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Grid,
  Collapse,
  IconButton
} from '@mui/material';
import { 
  FilterList, 
  Clear, 
  ExpandMore, 
  ExpandLess,
  Search,
  DateRange
} from '@mui/icons-material';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

const AdvancedFilters = ({ 
  onFiltersChange, 
  availableStatuses = [], 
  availableCategories = [],
  showDateFilter = true,
  showStatusFilter = true,
  showCategoryFilter = false,
  showSearchFilter = true
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    dateRange: 'today',
    startDate: '',
    endDate: ''
  });

  const dateRangeOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'custom', label: 'Período Personalizado' }
  ];

  const getDateRange = (range) => {
    const today = new Date();
    
    switch (range) {
      case 'today':
        return {
          start: new Date(today.setHours(0, 0, 0, 0)),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return {
          start: new Date(yesterday.setHours(0, 0, 0, 0)),
          end: new Date(yesterday.setHours(23, 59, 59, 999))
        };
      case 'week':
        return {
          start: startOfWeek(today),
          end: today
        };
      case 'month':
        return {
          start: startOfMonth(today),
          end: today
        };
      case 'last7days':
        return {
          start: subDays(today, 7),
          end: today
        };
      case 'last30days':
        return {
          start: subDays(today, 30),
          end: today
        };
      default:
        return { start: null, end: null };
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    if (key === 'dateRange' && value !== 'custom') {
      const dateRange = getDateRange(value);
      newFilters.startDate = dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : '';
      newFilters.endDate = dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : '';
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      category: '',
      dateRange: 'today',
      startDate: '',
      endDate: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== 'today'
    ).length;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">Filtros</Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip 
                label={getActiveFiltersCount()} 
                size="small" 
                color="primary" 
              />
            )}
          </Box>
          <Box>
            <Button
              startIcon={<Clear />}
              onClick={clearFilters}
              size="small"
              disabled={getActiveFiltersCount() === 0}
            >
              Limpar
            </Button>
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Quick Filters */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {showSearchFilter && (
            <TextField
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 200 }}
            />
          )}
          
          {showStatusFilter && availableStatuses.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                {availableStatuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            {showDateFilter && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      label="Período"
                    >
                      {dateRangeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {filters.dateRange === 'custom' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Data Inicial"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Data Final"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
            
            {showCategoryFilter && availableCategories.length > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Categoria"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {availableCategories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;