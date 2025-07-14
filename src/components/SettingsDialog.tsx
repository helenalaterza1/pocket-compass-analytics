import { useState, useRef } from 'react';
import { Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/hooks/useSettings';
import { useExpenses } from '@/hooks/useExpenses';
import { useToast } from '@/hooks/use-toast';

export function SettingsDialog() {
  const { settings, updateSettings } = useSettings();
  const { addExpense } = useExpenses();
  const { toast } = useToast();
  const [closingDay, setClosingDay] = useState(settings.cardClosingDay.toString());
  const [importType, setImportType] = useState<'fatura' | 'extrato'>('fatura');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateSettings({ cardClosingDay: parseInt(closingDay) });
  };

  const parseDate = (dateStr: string): Date => {
    // Try different date formats
    if (dateStr.includes('-')) {
      // Format: 2025-01-03
      return new Date(dateStr);
    } else if (dateStr.includes('/')) {
      // Format: 01/06/2025
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateStr);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Erro",
          description: "Arquivo CSV deve ter pelo menos uma linha de dados além do cabeçalho.",
          variant: "destructive"
        });
        return;
      }

      let importedCount = 0;
      const errors: string[] = [];

      try {
        if (importType === 'fatura') {
          // Skip header line
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const [date, title, amount] = line.split('\t');
            
            if (!date || !title || !amount) {
              errors.push(`Linha ${i + 1}: dados incompletos`);
              continue;
            }

            const amountNum = parseFloat(amount);
            if (amountNum <= 0) continue; // Skip negative or zero amounts for fatura

            try {
              addExpense({
                description: title.trim(),
                value: amountNum,
                category: 'lazer',
                subcategory: 'outros',
                paymentMethod: 'credit',
                date: parseDate(date.trim()).toISOString().split('T')[0]
              });
              importedCount++;
            } catch (error) {
              errors.push(`Linha ${i + 1}: erro ao processar data`);
            }
          }
        } else {
          // Extrato format
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const [data, valor, identificador, descricao] = line.split('\t');
            
            if (!data || !valor || !descricao) {
              errors.push(`Linha ${i + 1}: dados incompletos`);
              continue;
            }

            const valorNum = parseFloat(valor);
            if (valorNum >= 0) continue; // Skip positive values (income) for extrato

            try {
              addExpense({
                description: descricao.trim(),
                value: Math.abs(valorNum), // Convert negative to positive
                category: 'lazer',
                subcategory: 'outros',
                paymentMethod: 'debit',
                date: parseDate(data.trim()).toISOString().split('T')[0]
              });
              importedCount++;
            } catch (error) {
              errors.push(`Linha ${i + 1}: erro ao processar data`);
            }
          }
        }

        toast({
          title: "Importação concluída",
          description: `${importedCount} gastos importados com sucesso.${errors.length > 0 ? ` ${errors.length} erros encontrados.` : ''}`,
        });

        if (errors.length > 0) {
          console.warn('Erros na importação:', errors);
        }

      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Erro ao processar o arquivo CSV.",
          variant: "destructive"
        });
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4">
          <div className="space-y-3">
            <Label htmlFor="closing-day">Data de fechamento da fatura (cartão de crédito)</Label>
            <Select value={closingDay} onValueChange={(value) => {
              setClosingDay(value);
              updateSettings({ cardClosingDay: parseInt(value) });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {days.map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    Dia {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Gastos no cartão de crédito anteriores a esta data ficam no mês atual. 
              Gastos posteriores entram no mês seguinte.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Importar gastos do CSV</Label>
            
            <div className="space-y-3">
              <Select value={importType} onValueChange={(value: 'fatura' | 'extrato') => setImportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de arquivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fatura">Fatura do cartão</SelectItem>
                  <SelectItem value="extrato">Extrato bancário</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {importType === 'fatura' ? (
                  <p>Formato esperado: Data, Título, Valor (separados por TAB)</p>
                ) : (
                  <p>Formato esperado: Data, Valor, Identificador, Descrição (separados por TAB)</p>
                )}
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                ref={fileInputRef}
                className="hidden"
              />

              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar arquivo CSV
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}