import { useState } from 'react';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseChart } from '@/components/ExpenseChart';
import { ExpenseList } from '@/components/ExpenseList';
import { MonthSelector } from '@/components/MonthSelector';
import { useExpenses } from '@/hooks/useExpenses';
import { useToast } from '@/hooks/use-toast';
import { Wallet, TrendingUp } from 'lucide-react';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { addExpense, deleteExpense, getExpensesByMonth } = useExpenses();
  const { toast } = useToast();

  const currentMonthExpenses = getExpensesByMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth()
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
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-elegant">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Controle de Gastos</h1>
              <p className="text-muted-foreground">Gerencie suas finanças pessoais</p>
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
            <ExpenseForm onAddExpense={handleAddExpense} />
            
            {/* Stats Card */}
            <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground shadow-elegant">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Resumo do Mês</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-90">Total de Gastos</p>
                  <p className="text-2xl font-bold">
                    R$ {currentMonthExpenses.reduce((sum, expense) => sum + expense.value, 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Quantidade</p>
                  <p className="text-2xl font-bold">{currentMonthExpenses.length}</p>
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
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
