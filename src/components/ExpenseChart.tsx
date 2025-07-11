import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Expense, CATEGORIES } from '@/types/expense';

interface ExpenseChartProps {
  expenses: Expense[];
}

const CATEGORY_COLORS = {
  saude: '#ef4444',      // Red
  moradia: '#3b82f6',    // Blue  
  mercado: '#22c55e',    // Green
  transporte: '#f59e0b', // Orange
  lazer: '#8b5cf6'       // Purple
};

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  // Calculate totals by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.value;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals).map(([category, value]) => ({
    name: CATEGORIES[category as keyof typeof CATEGORIES],
    value,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-primary">R$ {data.value.toFixed(2)}</p>
          <p className="text-muted-foreground">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-card shadow-card">
        <h3 className="text-xl font-semibold mb-2">Gráfico de Gastos</h3>
        <p className="text-muted-foreground">Nenhum gasto registrado neste mês</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Distribuição por Categoria</h3>
        <p className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</p>
        <p className="text-muted-foreground">Total do mês</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}