import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Expense, CATEGORIES, PAYMENT_METHODS, SUBCATEGORIES } from '@/types/expense';
import { useSettings } from '@/hooks/useSettings';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [value, setValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | ''>('');
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { settings } = useSettings();

  const getBillingInfo = () => {
    if (paymentMethod === 'credit' && date) {
      const expenseDay = date.getDate();
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      
      if (expenseDay > settings.cardClosingDay) {
        // Goes to next month's bill
        const nextMonth = new Date(currentYear, currentMonth + 1);
        return {
          month: format(nextMonth, 'MMMM', { locale: ptBR }),
          isNextMonth: true
        };
      } else {
        // Stays in current month's bill
        const currentMonthName = format(date, 'MMMM', { locale: ptBR });
        return {
          month: currentMonthName,
          isNextMonth: false
        };
      }
    }
    return null;
  };

  const billingInfo = getBillingInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value || !paymentMethod || !category || !subcategory) {
      return;
    }

    const expense: Omit<Expense, 'id'> = {
      value: parseFloat(value),
      paymentMethod: paymentMethod as 'credit' | 'debit',
      date: format(date, 'yyyy-MM-dd'),
      category: category as any,
      subcategory,
      description: description || undefined
    };

    onAddExpense(expense);
    
    // Reset form
    setValue('');
    setPaymentMethod('');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setDate(new Date());
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSubcategory(''); // Reset subcategory when category changes
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Novo Gasto</h2>
          <p className="text-muted-foreground">Registre um novo gasto pessoal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0,00"
              className="text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'credit' | 'debit')} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {billingInfo && (
              <div className="flex items-center space-x-2 mt-2 p-3 bg-muted/50 rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Esse gasto está na sua fatura do mês de <strong>{billingInfo.month}</strong>, e será adicionado por lá
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={handleCategoryChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Select value={subcategory} onValueChange={setSubcategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBCATEGORIES[category as keyof typeof SUBCATEGORIES] || {}).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione uma descrição para este gasto..."
            rows={3}
            className="resize-none"
          />
        </div>

        <Button 
          type="submit" 
          variant="gradient"
          size="lg"
          className="w-full"
        >
          <Plus className="mr-2 h-5 w-5" />
          Adicionar Gasto
        </Button>
      </form>
    </Card>
  );
}