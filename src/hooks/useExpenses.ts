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
    setExpenses(prev => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const getExpensesByMonth = (year: number, month: number, cardClosingDay: number = 5) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      // For credit card expenses, adjust month based on closing day
      if (expense.paymentMethod === 'credit') {
        const expenseDay = expenseDate.getDate();
        
        if (expenseDay > cardClosingDay) {
          // If expense is after closing day, it goes to next month's bill
          const nextMonth = new Date(expenseDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          return nextMonth.getFullYear() === year && nextMonth.getMonth() === month;
        }
      }
      
      // For debit or credit expenses before closing day, use actual date
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  };

  return {
    expenses,
    addExpense,
    deleteExpense,
    getExpensesByMonth
  };
}