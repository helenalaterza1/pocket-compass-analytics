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
import * as XLSX from 'xlsx';

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

  const parseDate = (dateValue: any): Date => {
    console.log('Parsing date:', dateValue, 'Type:', typeof dateValue);
    
    // Handle Excel date values
    if (typeof dateValue === 'number') {
      // Excel date serial number
      const parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
      console.log('Excel date parsed to:', parsedDate);
      return parsedDate;
    }
    
    const dateStr = String(dateValue);
    console.log('Date string:', dateStr);
    
    // Try different date formats
    if (dateStr.includes('-')) {
      // Format: 2025-01-03
      const parsedDate = new Date(dateStr);
      console.log('ISO date parsed to:', parsedDate);
      return parsedDate;
    } else if (dateStr.includes('/')) {
      // Format: 01/06/2025 or 01/06/25
      const parts = dateStr.split('/');
      console.log('Date parts:', parts);
      
      if (parts.length === 3) {
        const [day, month, year] = parts;
        let fullYear = parseInt(year);
        
        // Handle 2-digit years
        if (fullYear < 100) {
          fullYear = fullYear > 50 ? 1900 + fullYear : 2000 + fullYear;
        }
        
        const parsedDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));
        console.log('Slash date parsed to:', parsedDate);
        return parsedDate;
      }
    }
    
    const fallbackDate = new Date(dateStr);
    console.log('Fallback date parsed to:', fallbackDate);
    return fallbackDate;
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting file import. File:', file.name, 'Type:', importType);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log('Excel data loaded. Rows:', jsonData.length);
        console.log('First few rows:', jsonData.slice(0, 3));

        if (jsonData.length < 2) {
          toast({
            title: "Erro",
            description: "Arquivo Excel deve ter pelo menos uma linha de dados além do cabeçalho.",
            variant: "destructive"
          });
          return;
        }

        let importedCount = 0;
        const errors: string[] = [];

        if (importType === 'fatura') {
          // Fatura format: date, title, amount (columns A, B, C)
          console.log('Processing as fatura...');
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            console.log(`Processing fatura row ${i}:`, row);
            
            if (!row || row.length < 3) {
              console.log(`Skipping row ${i}: insufficient columns`);
              continue;
            }
            
            const [date, title, amount] = row;
            console.log(`Row ${i} - Date: ${date}, Title: ${title}, Amount: ${amount}`);
            
            if (!date || !title || amount === undefined || amount === null) {
              errors.push(`Linha ${i + 1}: dados incompletos`);
              console.log(`Row ${i}: incomplete data`);
              continue;
            }

            const amountNum = typeof amount === 'number' ? amount : parseFloat(String(amount));
            console.log(`Row ${i} - Parsed amount:`, amountNum);
            
            if (isNaN(amountNum) || amountNum <= 0) {
              console.log(`Row ${i}: invalid amount, skipping`);
              continue;
            }

            try {
              const expenseDate = parseDate(date);
              const expenseData = {
                description: String(title).trim(),
                value: amountNum,
                category: 'lazer' as const,
                subcategory: 'outros',
                paymentMethod: 'credit' as const,
                date: expenseDate.toISOString().split('T')[0]
              };
              console.log(`Adding fatura expense:`, expenseData);
              addExpense(expenseData);
              importedCount++;
            } catch (error) {
              errors.push(`Linha ${i + 1}: erro ao processar data`);
              console.error(`Row ${i} date parsing error:`, error);
            }
          }
        } else {
          // Extrato format: Data, Valor, Identificador, Descrição (columns A, B, C, D)
          console.log('Processing as extrato...');
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            console.log(`Processing extrato row ${i}:`, row);
            
            if (!row || row.length < 4) {
              console.log(`Skipping row ${i}: insufficient columns (need 4, got ${row?.length})`);
              continue;
            }
            
            const [data, valor, identificador, descricao] = row;
            console.log(`Row ${i} - Data: ${data}, Valor: ${valor}, ID: ${identificador}, Descrição: ${descricao}`);
            
            if (!data || valor === undefined || valor === null || !descricao) {
              errors.push(`Linha ${i + 1}: dados incompletos`);
              console.log(`Row ${i}: incomplete data`);
              continue;
            }

            const valorNum = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
            console.log(`Row ${i} - Parsed valor:`, valorNum);
            
            if (isNaN(valorNum) || valorNum >= 0) {
              console.log(`Row ${i}: invalid valor (${valorNum}) or positive value, skipping`);
              continue;
            }

            try {
              const expenseDate = parseDate(data);
              const expenseData = {
                description: String(descricao).trim(),
                value: Math.abs(valorNum), // Convert negative to positive
                category: 'lazer' as const,
                subcategory: 'outros',
                paymentMethod: 'debit' as const,
                date: expenseDate.toISOString().split('T')[0]
              };
              console.log(`Adding extrato expense:`, expenseData);
              addExpense(expenseData);
              importedCount++;
            } catch (error) {
              errors.push(`Linha ${i + 1}: erro ao processar data`);
              console.error(`Row ${i} date parsing error:`, error);
            }
          }
        }

        console.log(`Import completed. Imported: ${importedCount}, Errors: ${errors.length}`);

        toast({
          title: "Importação concluída",
          description: `${importedCount} gastos importados com sucesso.${errors.length > 0 ? ` ${errors.length} erros encontrados.` : ''}`,
        });

        if (errors.length > 0) {
          console.warn('Erros na importação:', errors);
        }

      } catch (error) {
        console.error('Erro na importação:', error);
        toast({
          title: "Erro na importação",
          description: "Erro ao processar o arquivo Excel.",
          variant: "destructive"
        });
      }
    };

    reader.readAsArrayBuffer(file);
    
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
            <Label>Importar gastos do Excel</Label>
            
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
                  <p>Formato esperado: Coluna A = Data, Coluna B = Título, Coluna C = Valor</p>
                ) : (
                  <p>Formato esperado: Coluna A = Data, Coluna B = Valor, Coluna C = Identificador, Coluna D = Descrição</p>
                )}
              </div>

              <input
                type="file"
                accept=".xlsx,.xls"
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
                Selecionar arquivo Excel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
