export interface Expense {
  id: string;
  value: number;
  paymentMethod: 'credit' | 'debit';
  date: string;
  category: 'saude' | 'moradia' | 'mercado' | 'transporte' | 'lazer';
}

export const CATEGORIES = {
  saude: 'Saúde',
  moradia: 'Moradia', 
  mercado: 'Mercado',
  transporte: 'Transporte',
  lazer: 'Lazer'
} as const;

export const PAYMENT_METHODS = {
  credit: 'Crédito',
  debit: 'Débito'
} as const;