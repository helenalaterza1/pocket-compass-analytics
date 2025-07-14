import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, CreditCard, Banknote, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Expense, CATEGORIES, PAYMENT_METHODS, SUBCATEGORIES } from '@/types/expense';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

const CATEGORY_COLORS = {
  saude: 'bg-red-100 text-red-800 border-red-200',
  moradia: 'bg-blue-100 text-blue-800 border-blue-200',
  mercado: 'bg-green-100 text-green-800 border-green-200', 
  transporte: 'bg-orange-100 text-orange-800 border-orange-200',
  lazer: 'bg-purple-100 text-purple-800 border-purple-200'
};

export function ExpenseList({ expenses, onDeleteExpense, onEditExpense }: ExpenseListProps) {
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-card shadow-card">
        <h3 className="text-xl font-semibold mb-2">Lista de Gastos</h3>
        <p className="text-muted-foreground">Nenhum gasto registrado neste mês</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Lista de Gastos</h3>
        <Badge variant="secondary" className="text-sm">
          {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
        </Badge>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {expense.paymentMethod === 'credit' ? (
                  <CreditCard className="h-5 w-5 text-primary" />
                ) : (
                  <Banknote className="h-5 w-5 text-accent" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge 
                    variant="outline"
                    className={CATEGORY_COLORS[expense.category]}
                  >
                    {CATEGORIES[expense.category]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {SUBCATEGORIES[expense.category]?.[expense.subcategory as keyof typeof SUBCATEGORIES[typeof expense.category]] || expense.subcategory}
                  </Badge>
                  <Badge variant="outline">
                    {PAYMENT_METHODS[expense.paymentMethod]}
                  </Badge>
                </div>
                {expense.description && (
                  <p className="text-sm text-foreground mb-1 font-medium truncate">
                    {expense.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {format(new Date(expense.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">
                  R$ {expense.value.toFixed(2)}
                </p>
              </div>
              
              <div className="flex flex-col space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditExpense(expense)}
                  className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteExpense(expense.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total:</p>
          <p className="text-2xl font-bold text-primary">
            R$ {expenses.reduce((sum, expense) => sum + expense.value, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
}