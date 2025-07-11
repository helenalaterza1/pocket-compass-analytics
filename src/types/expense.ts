export interface Expense {
  id: string;
  value: number;
  paymentMethod: 'credit' | 'debit';
  date: string;
  category: 'saude' | 'moradia' | 'mercado' | 'transporte' | 'lazer';
  subcategory: string;
  description?: string;
}

export const CATEGORIES = {
  saude: 'Saúde',
  moradia: 'Moradia', 
  mercado: 'Mercado',
  transporte: 'Transporte',
  lazer: 'Lazer'
} as const;

export const SUBCATEGORIES = {
  saude: {
    'plano-saude': 'Plano de saúde',
    'remedios': 'Remédios',
    'cuidados-pessoais': 'Cuidados Pessoais'
  },
  transporte: {
    'uber-99': '99/Uber',
    'gasolina': 'Gasolina',
    'manutencao': 'Manutenção do Carro',
    'seguro': 'Seguro',
    'taxas': 'Taxas'
  },
  moradia: {
    'aluguel': 'Aluguel',
    'condominio': 'Condomínio',
    'faxina': 'Faxina',
    'gas': 'Gás',
    'luz': 'Luz',
    'internet': 'Internet',
    'outros': 'Outros'
  },
  lazer: {
    'bar': 'Bar',
    'restaurante': 'Restaurante',
    'show': 'Show',
    'viagem': 'Viagem'
  },
  mercado: {
    'comida': 'Comida',
    'alcool': 'Álcool',
    'outros': 'Outros'
  }
} as const;

export const PAYMENT_METHODS = {
  credit: 'Crédito',
  debit: 'Débito'
} as const;