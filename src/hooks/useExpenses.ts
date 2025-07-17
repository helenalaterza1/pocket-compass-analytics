import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';

const STORAGE_KEY = 'personal-expenses';

// Global expenses state
let globalExpenses: Expense[] = [];
let listeners: Array<(expenses: Expense[]) => void> = [];

// Load initial data from localStorage
const loadFromStorage = () => {
  console.log('Loading expenses from localStorage...');
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('Loaded expenses from localStorage:', parsed.length, 'expenses');
      globalExpenses = parsed;
    } catch (error) {
      console.error('Error loading expenses:', error);
      globalExpenses = [];
    }
  } else {
    console.log('No expenses found in localStorage');
    globalExpenses = [];
  }
};

// Save to localStorage
const saveToStorage = () => {
  console.log('Saving expenses to localStorage:', globalExpenses.length, 'expenses');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(globalExpenses));
};

// Notify all listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener([...globalExpenses]));
};

// Initialize on first import
if (globalExpenses.length === 0) {
  loadFromStorage();
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(globalExpenses);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (newExpenses: Expense[]) => {
      console.log('useExpenses received update:', newExpenses.length, 'expenses');
      setExpenses(newExpenses);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID()
    };
    console.log('Adding expense to global state:', newExpense);
    
    globalExpenses = [...globalExpenses, newExpense];
    saveToStorage();
    notifyListeners();
  };

  const deleteExpense = (id: string) => {
    console.log('Deleting expense from global state:', id);
    globalExpenses = globalExpenses.filter(expense => expense.id !== id);
    saveToStorage();
    notifyListeners();
  };

  const updateExpense = (id: string, expenseData: Omit<Expense, 'id'>) => {
    console.log('Updating expense in global state:', id);
    globalExpenses = globalExpenses.map(expense => 
      expense.id === id ? { ...expenseData, id } : expense
    );
    saveToStorage();
    notifyListeners();
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