import { useState } from 'react';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseChart } from '@/components/ExpenseChart';
import { ExpenseList } from '@/components/ExpenseList';
import { MonthSelector } from '@/components/MonthSelector';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useExpenses } from '@/hooks/useExpenses';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { Expense } from '@/types/expense';
import { Wallet, TrendingUp } from 'lucide-react';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { addExpense, deleteExpense, updateExpense, getExpensesByMonth } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  const currentMonthExpenses = getExpensesByMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    settings.cardClosingDay
  );

  const handleAddExpense = (expenseData: any) => {
    addExpense(expenseData);
    toast({
      title: "Gasto adicionado!",
      description: `R$ ${expenseData.value.toFixed(2)} em ${expenseData.category} foi registrado.`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast({
      title: "Gasto removido",
      description: "O gasto foi excluído com sucesso.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header with enhanced design */}
      <header className="bg-gradient-primary shadow-elegant border-b border-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img 
                  src="/lovable-uploads/ce1de821-0d87-4b02-b4de-02ab51bb89eb.png" 
                  alt="Lebiste Finanças" 
                  className="h-16 w-auto drop-shadow-lg hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl opacity-50"></div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Lebiste Finanças
                </h1>
                <p className="text-blue-100/90 text-lg font-medium">Gerencie suas finanças com simplicidade</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
              <SettingsDialog />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Selector */}
        <div className="mb-8">
          <MonthSelector 
            selectedDate={selectedDate}
            onMonthChange={setSelectedDate}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-8">
            <ExpenseForm 
              onAddExpense={handleAddExpense}
              editingExpense={editingExpense}
              onUpdateExpense={updateExpense}
              onCancelEdit={() => setEditingExpense(null)}
            />
            
            {/* Enhanced Stats Card */}
            <div className="relative bg-gradient-primary rounded-2xl p-8 text-primary-foreground shadow-elegant overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-white/15 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Resumo do Mês</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm opacity-90 mb-2">Total de Gastos</p>
                    <p className="text-3xl font-bold">
                      R$ {currentMonthExpenses.reduce((sum, expense) => sum + expense.value, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm opacity-90 mb-2">Quantidade</p>
                    <p className="text-3xl font-bold">{currentMonthExpenses.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chart and List */}
          <div className="space-y-8">
            <ExpenseChart expenses={currentMonthExpenses} />
            <ExpenseList 
              expenses={currentMonthExpenses}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={(expense) => setEditingExpense(expense)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
