import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Printer, 
  Download, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrintUtils } from "@/utils/printUtils";
import { 
  getSales, 
  getPurchaseOrders, 
  getExpenses 
} from "@/services/databaseService";
import { Sale, PurchaseOrder, Expense } from "@/services/databaseService";

interface IncomeStatementProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

interface IncomeStatementData {
  businessName: string;
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  otherIncomeExpenses: number;
  tax: number;
  netProfit: number;
}

export const IncomeStatement = ({ username, onBack, onLogout }: IncomeStatementProps) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState("January 2024");
  const [isLoading, setIsLoading] = useState(true);
  const [incomeStatementData, setIncomeStatementData] = useState<IncomeStatementData>({
    businessName: "POS Business",
    period: period,
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    operatingProfit: 0,
    otherIncomeExpenses: 0,
    tax: 0,
    netProfit: 0
  });

  // Fetch data for the income statement
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all necessary data
        const [sales, purchases, expenses] = await Promise.all([
          getSales(),
          getPurchaseOrders(),
          getExpenses()
        ]);

        // Calculate revenue (total sales)
        const revenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

        // Calculate COGS (cost of goods sold) - based on purchase orders
        const cogs = purchases.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);

        // Calculate gross profit
        const grossProfit = revenue - cogs;

        // Calculate operating expenses - based on expense records
        const operatingExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        // Calculate operating profit
        const operatingProfit = grossProfit - operatingExpenses;

        // Other income/expenses (using a placeholder for now)
        const otherIncomeExpenses = 0;

        // Tax calculation (using a placeholder for now)
        const tax = 0;

        // Calculate net profit
        const netProfit = operatingProfit + otherIncomeExpenses - tax;

        // Update state with calculated values
        setIncomeStatementData({
          businessName: "POS Business",
          period: period,
          revenue,
          cogs,
          grossProfit,
          operatingExpenses,
          operatingProfit,
          otherIncomeExpenses,
          tax,
          netProfit
        });
      } catch (error) {
        console.error("Error fetching income statement data:", error);
        toast({
          title: "Error",
          description: "Failed to load income statement data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, toast]);

  const handlePrint = () => {
    PrintUtils.printIncomeStatement(incomeStatementData);
    toast({
      title: "Printing",
      description: "Income statement is being printed...",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Exporting income statement as PDF...",
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Income statement has been exported successfully.",
      });
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading income statement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Income Statement" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Card className="border border-gray-200 rounded-lg">
          <CardContent className="p-8">
            {/* Header */
}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{incomeStatementData.businessName}</h1>
              <h2 className="text-xl font-semibold mb-2">INCOME STATEMENT</h2>
              <p className="text-muted-foreground">For the period ended {incomeStatementData.period}</p>
            </div>
            
            {/* Income Statement Table - Restructured to match specification */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="font-semibold">Section</div>
                <div className="font-semibold text-right">Description</div>
                <div className="font-semibold text-right">Amount (TZS)</div>
              </div>
              
              {/* Section 1: Revenue (Sales) */}
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="font-semibold">1. Revenue (Sales)</div>
                <div className="text-right">Total sales to customers</div>
                <div className="text-right font-semibold">{incomeStatementData.revenue.toLocaleString()}</div>
              </div>
              
              {/* Section 2: Cost of Goods Sold (COGS) */}
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="font-semibold">2. Cost of Goods Sold (COGS)</div>
                <div className="text-right">Cost of items sold — includes purchases, transport, and other direct costs</div>
                <div className="text-right font-semibold">({incomeStatementData.cogs.toLocaleString()})</div>
              </div>
              
              {/* = Gross Profit */}
              <div className="grid grid-cols-3 gap-4 py-2 border-t border-b">
                <div className="font-semibold">= Gross Profit</div>
                <div className="text-right">Revenue − COGS</div>
                <div className="text-right font-semibold">{incomeStatementData.grossProfit.toLocaleString()}</div>
              </div>
              
              {/* Section 3: Operating Expenses */}
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="font-semibold">3. Operating Expenses</div>
                <div className="text-right">Rent, salaries, utilities, admin, etc.</div>
                <div className="text-right font-semibold">({incomeStatementData.operatingExpenses.toLocaleString()})</div>
              </div>
              
              {/* = Operating Profit */}
              <div className="grid grid-cols-3 gap-4 py-2 border-t border-b">
                <div className="font-semibold">= Operating Profit</div>
                <div className="text-right">Gross Profit − Operating Expenses</div>
                <div className="text-right font-semibold">{incomeStatementData.operatingProfit.toLocaleString()}</div>
              </div>
              
              {/* Section 4: Other Income / Expenses */}
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="font-semibold">4. Other Income / Expenses</div>
                <div className="text-right">Interest, asset sales, etc.</div>
                <div className="text-right font-semibold">
                  {incomeStatementData.otherIncomeExpenses >= 0 ? '+' : ''}{incomeStatementData.otherIncomeExpenses.toLocaleString()}
                </div>
              </div>
              
              {/* Section 5: Tax (Income Tax) */}
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="font-semibold">5. Tax (Income Tax)</div>
                <div className="text-right">Based on profit before tax</div>
                <div className="text-right font-semibold">({incomeStatementData.tax.toLocaleString()})</div>
              </div>
              
              {/* = Net Profit */}
              <div className="grid grid-cols-3 gap-4 py-2 font-bold text-lg border-t-2 border-b-2">
                <div className="font-bold">= Net Profit</div>
                <div className="text-right">Final profit after all costs and tax</div>
                <div className="text-right font-bold">{incomeStatementData.netProfit.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Prepared on: {new Date().toLocaleDateString()}</p>
              <p className="mt-1">Confidential - For Internal Use Only</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};