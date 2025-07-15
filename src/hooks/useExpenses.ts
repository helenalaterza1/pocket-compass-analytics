import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';

const STORAGE_KEY = 'personal-expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load expenses from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading expenses:', error);
      }
    }
  }, []);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID()
    };
    console.log('Adding expense to useExpenses:', newExpense);
    setExpenses(prev => {
      const updated = [...prev, newExpense];
      console.log('Updated expenses array:', updated);
      return updated;
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateExpense = (id: string, expenseData: Omit<Expense, 'id'>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expenseData, id } : expense
    ));
  };

  const getExpensesByMonth = (year: number, month: number, cardClosingDay: number = 5) => {
    console.log('getExpensesByMonth called with:', { year, month, cardClosingDay });
    console.log('Total expenses:', expenses.length);
    
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      console.log('Checking expense:', expense.description, 'Date:', expense.date, 'Parsed:', expenseDate);
      
      // For credit card expenses, adjust month based on closing day
      if (expense.paymentMethod === 'credit') {
        const expenseDay = expenseDate.getDate();
        
        if (expenseDay > cardClosingDay) {
          // If expense is after closing day, it goes to next month's bill
          const nextMonth = new Date(expenseDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const matches = nextMonth.getFullYear() === year && nextMonth.getMonth() === month;
          console.log('Credit card expense (after closing):', matches);
          return matches;
        }
      }
      
      // For debit or credit expenses before closing day, use actual date
      const matches = expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
      console.log('Regular expense match:', matches);
      return matches;
    });
    
    console.log('Filtered expenses for month:', filtered);
    return filtered;
  };

  return {
    expenses,
    addExpense,
    deleteExpense,
    updateExpense,
    getExpensesByMonth
  };
}