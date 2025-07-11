import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';

export function SettingsDialog() {
  const { settings, updateSettings } = useSettings();
  const [closingDay, setClosingDay] = useState(settings.cardClosingDay.toString());

  const handleSave = () => {
    updateSettings({ cardClosingDay: parseInt(closingDay) });
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
        </div>
      </DialogContent>
    </Dialog>
  );
}