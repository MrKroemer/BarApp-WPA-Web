import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, RadioGroup, Radio, FormLabel, 
  FormControlLabel, Checkbox, FormGroup, Grid, Divider, Typography, Box,
  Accordion, AccordionSummary, AccordionDetails, Switch, Chip
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const CashbackRuleDialog = ({ open, onClose, onSave, rule = null, products = [] }) => {
  const [formData, setFormData] = useState({
    // Seção 1: Informações Básicas
    name: '',
    status: true,
    description: '',
    
    // Seção 2: Regras de Geração
    calculationType: 'percentage', // 'percentage' ou 'fixed'
    value: '',
    calculationBase: 'total', // 'total' ou 'specific'
    selectedCategories: [],
    selectedProducts: [],
    minSpend: '',
    maxCashback: '',
    
    // Seção 3: Regras de Validade
    campaignPeriod: 'always', // 'always' ou 'specific'
    startDate: '',
    endDate: '',
    daysOfWeek: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    hasTimeRestriction: false,
    startTime: '',
    endTime: '',
    
    // Seção 4: Regras de Resgate
    expirationRule: 'days', // 'days', 'never', 'fixed'
    expirationDays: '30',
    expirationDate: '',
    minRedemptionSpend: '',
    redemptionLimit: 'unlimited', // 'unlimited', 'percentage', 'fixed'
    redemptionPercentage: '50',
    redemptionAmount: '',
    preventCashbackOnCashback: true,
    allowWithOtherPromotions: false
  });

  React.useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        status: rule.isActive !== false,
        description: rule.description || '',
        calculationType: rule.calculationType || 'percentage',
        value: rule.value?.toString() || '',
        calculationBase: rule.calculationBase || 'total',
        selectedCategories: rule.selectedCategories || [],
        selectedProducts: rule.selectedProducts || [],
        minSpend: rule.minSpend?.toString() || '',
        maxCashback: rule.maxCashback?.toString() || '',
        campaignPeriod: rule.campaignPeriod || 'always',
        startDate: rule.startDate || '',
        endDate: rule.endDate || '',
        daysOfWeek: rule.daysOfWeek || {
          monday: false, tuesday: false, wednesday: false, thursday: false,
          friday: false, saturday: false, sunday: false
        },
        hasTimeRestriction: rule.hasTimeRestriction || false,
        startTime: rule.startTime || '',
        endTime: rule.endTime || '',
        expirationRule: rule.expirationRule || 'days',
        expirationDays: rule.expirationDays?.toString() || '30',
        expirationDate: rule.expirationDate || '',
        minRedemptionSpend: rule.minRedemptionSpend?.toString() || '',
        redemptionLimit: rule.redemptionLimit || 'unlimited',
        redemptionPercentage: rule.redemptionPercentage?.toString() || '50',
        redemptionAmount: rule.redemptionAmount?.toString() || '',
        preventCashbackOnCashback: rule.preventCashbackOnCashback !== false,
        allowWithOtherPromotions: rule.allowWithOtherPromotions || false
      });
    }
  }, [rule]);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCheckboxChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked
    }));
  };

  const handleDayChange = (day) => (e) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: {
        ...prev.daysOfWeek,
        [day]: e.target.checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      alert('Nome da campanha é obrigatório');
      return;
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      alert('Valor do cashback deve ser maior que zero');
      return;
    }

    const ruleData = {
      ...formData,
      value: parseFloat(formData.value),
      minSpend: formData.minSpend ? parseFloat(formData.minSpend) : 0,
      maxCashback: formData.maxCashback ? parseFloat(formData.maxCashback) : 0,
      expirationDays: formData.expirationDays ? parseInt(formData.expirationDays) : 30,
      minRedemptionSpend: formData.minRedemptionSpend ? parseFloat(formData.minRedemptionSpend) : 0,
      redemptionPercentage: formData.redemptionPercentage ? parseFloat(formData.redemptionPercentage) : 50,
      redemptionAmount: formData.redemptionAmount ? parseFloat(formData.redemptionAmount) : 0
    };

    onSave(ruleData);
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const generateRuleSummary = () => {
    const parts = [];
    
    if (formData.calculationType === 'percentage') {
      parts.push(`${formData.value}% de cashback`);
    } else {
      parts.push(`R$ ${formData.value} de cashback fixo`);
    }
    
    if (formData.calculationBase === 'specific' && (formData.selectedCategories.length > 0 || formData.selectedProducts.length > 0)) {
      parts.push('em itens específicos');
    } else {
      parts.push('no valor total');
    }
    
    if (formData.minSpend) {
      parts.push(`com gasto mínimo de R$ ${formData.minSpend}`);
    }
    
    if (formData.maxCashback) {
      parts.push(`limitado a R$ ${formData.maxCashback}`);
    }
    
    return parts.join(', ');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {rule ? 'Editar Regra de Cashback' : 'Nova Regra de Cashback'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Seção 1: Informações Básicas */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">1. Informações Básicas da Campanha</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Nome da Campanha"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                    placeholder="Ex: Happy Hour do Chopp, Cashback de Aniversário"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status}
                        onChange={handleCheckboxChange('status')}
                      />
                    }
                    label="Campanha Ativa"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição (Opcional)"
                    multiline
                    rows={2}
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    placeholder="Descreva o objetivo desta campanha..."
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Seção 2: Regras de Geração */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">2. Regras de Geração (Como o cliente ganha)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Tipo de Cálculo do Cashback</FormLabel>
                    <RadioGroup
                      value={formData.calculationType}
                      onChange={handleInputChange('calculationType')}
                      row
                    >
                      <FormControlLabel value="percentage" control={<Radio />} label="Porcentagem (%)" />
                      <FormControlLabel value="fixed" control={<Radio />} label="Valor Fixo (R$)" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={formData.calculationType === 'percentage' ? 'Porcentagem (%)' : 'Valor Fixo (R$)'}
                    type="number"
                    value={formData.value}
                    onChange={handleInputChange('value')}
                    required
                    inputProps={{ 
                      min: 0, 
                      step: formData.calculationType === 'percentage' ? 0.1 : 0.01 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gasto Mínimo (R$)"
                    type="number"
                    value={formData.minSpend}
                    onChange={handleInputChange('minSpend')}
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder="0 = sem mínimo"
                  />
                </Grid>
                
                {formData.calculationType === 'percentage' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cashback Máximo (R$)"
                      type="number"
                      value={formData.maxCashback}
                      onChange={handleInputChange('maxCashback')}
                      inputProps={{ min: 0, step: 0.01 }}
                      placeholder="0 = sem limite"
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Base de Cálculo</FormLabel>
                    <RadioGroup
                      value={formData.calculationBase}
                      onChange={handleInputChange('calculationBase')}
                    >
                      <FormControlLabel 
                        value="total" 
                        control={<Radio />} 
                        label="Valor total do pedido" 
                      />
                      <FormControlLabel 
                        value="specific" 
                        control={<Radio />} 
                        label="Apenas itens específicos" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {formData.calculationBase === 'specific' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Categorias Específicas</InputLabel>
                        <Select
                          multiple
                          value={formData.selectedCategories}
                          onChange={handleInputChange('selectedCategories')}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Produtos Específicos</InputLabel>
                        <Select
                          multiple
                          value={formData.selectedProducts}
                          onChange={handleInputChange('selectedProducts')}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const product = products.find(p => p.id === value);
                                return (
                                  <Chip key={value} label={product?.name || value} size="small" />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} - {product.category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Seção 3: Regras de Validade */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">3. Regras de Validade (Quando funciona)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Período da Campanha</FormLabel>
                    <RadioGroup
                      value={formData.campaignPeriod}
                      onChange={handleInputChange('campaignPeriod')}
                    >
                      <FormControlLabel value="always" control={<Radio />} label="Sempre ativa" />
                      <FormControlLabel value="specific" control={<Radio />} label="Período específico" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {formData.campaignPeriod === 'specific' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Data de Início"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange('startDate')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Data de Fim"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange('endDate')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <FormLabel component="legend">Dias da Semana</FormLabel>
                  <FormGroup row>
                    {Object.entries({
                      monday: 'Segunda',
                      tuesday: 'Terça',
                      wednesday: 'Quarta',
                      thursday: 'Quinta',
                      friday: 'Sexta',
                      saturday: 'Sábado',
                      sunday: 'Domingo'
                    }).map(([key, label]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={formData.daysOfWeek[key]}
                            onChange={handleDayChange(key)}
                          />
                        }
                        label={label}
                      />
                    ))}
                  </FormGroup>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.hasTimeRestriction}
                        onChange={handleCheckboxChange('hasTimeRestriction')}
                      />
                    }
                    label="Restringir por horário"
                  />
                </Grid>
                
                {formData.hasTimeRestriction && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Horário de Início"
                        type="time"
                        value={formData.startTime}
                        onChange={handleInputChange('startTime')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Horário de Fim"
                        type="time"
                        value={formData.endTime}
                        onChange={handleInputChange('endTime')}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Seção 4: Regras de Resgate */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">4. Regras de Resgate (Como o cliente usa)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Validade do Cashback</FormLabel>
                    <RadioGroup
                      value={formData.expirationRule}
                      onChange={handleInputChange('expirationRule')}
                    >
                      <FormControlLabel value="days" control={<Radio />} label="Expira em X dias" />
                      <FormControlLabel value="never" control={<Radio />} label="Nunca expira" />
                      <FormControlLabel value="fixed" control={<Radio />} label="Data fixa de expiração" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {formData.expirationRule === 'days' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Dias para Expirar"
                      type="number"
                      value={formData.expirationDays}
                      onChange={handleInputChange('expirationDays')}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                )}
                
                {formData.expirationRule === 'fixed' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Data de Expiração"
                      type="date"
                      value={formData.expirationDate}
                      onChange={handleInputChange('expirationDate')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gasto Mínimo para Resgatar (R$)"
                    type="number"
                    value={formData.minRedemptionSpend}
                    onChange={handleInputChange('minRedemptionSpend')}
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder="0 = sem mínimo"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Limite de Uso do Cashback</FormLabel>
                    <RadioGroup
                      value={formData.redemptionLimit}
                      onChange={handleInputChange('redemptionLimit')}
                    >
                      <FormControlLabel value="unlimited" control={<Radio />} label="Sem limite (pode usar todo o saldo)" />
                      <FormControlLabel value="percentage" control={<Radio />} label="Máximo % do valor do pedido" />
                      <FormControlLabel value="fixed" control={<Radio />} label="Valor máximo fixo por pedido" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {formData.redemptionLimit === 'percentage' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Porcentagem Máxima (%)"
                      type="number"
                      value={formData.redemptionPercentage}
                      onChange={handleInputChange('redemptionPercentage')}
                      inputProps={{ min: 1, max: 100 }}
                    />
                  </Grid>
                )}
                
                {formData.redemptionLimit === 'fixed' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Valor Máximo (R$)"
                      type="number"
                      value={formData.redemptionAmount}
                      onChange={handleInputChange('redemptionAmount')}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.preventCashbackOnCashback}
                          onChange={handleCheckboxChange('preventCashbackOnCashback')}
                        />
                      }
                      label="Não gerar cashback quando usar cashback (evitar loop)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.allowWithOtherPromotions}
                          onChange={handleCheckboxChange('allowWithOtherPromotions')}
                        />
                      }
                      label="Permitir acumular com outras promoções"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Resumo da Regra */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Resumo da Regra
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {generateRuleSummary()}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {rule ? 'Atualizar' : 'Criar'} Regra
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CashbackRuleDialog;