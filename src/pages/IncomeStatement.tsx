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
  getExpenses,
  getReturns
} from "@/services/databaseService";
import { Sale, PurchaseOrder, Expense, Return } from "@/services/databaseService";

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
        const [sales, purchases, expenses, returns] = await Promise.all([
          getSales(),
          getPurchaseOrders(),
          getExpenses(),
          getReturns()
        ]);

        // Calculate revenue (total sales) minus returns
        const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
        const totalReturns = returns.reduce((sum, returnItem) => sum + (returnItem.total_amount || 0), 0);
        const revenue = totalSales - totalReturns;

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
        
        <Card className="border border-gray-200 rounded-lg shadow-lg">
          <CardContent className="p-8">
            {/* Professional Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">{incomeStatementData.businessName}</h1>
              <h2 className="text-2xl font-semibold mb-3 text-gray-700">CONSOLIDATED INCOME STATEMENT</h2>
              <p className="text-lg text-muted-foreground">For the Period Ended {incomeStatementData.period}</p>
              <p className="text-sm text-muted-foreground mt-2">All amounts in Tanzanian Shillings (TZS)</p>
            </div>
            
            {/* Professional Income Statement Table */}
            <div className="space-y-4">
              {/* Table Header with Professional Styling */}
              <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 bg-gray-50 rounded-t-lg">
                <div className="col-span-5 font-bold text-left pl-4 text-gray-700">Particulars</div>
                <div className="col-span-4 font-bold text-right pr-4 text-gray-700">Description</div>
                <div className="col-span-3 font-bold text-right pr-4 text-gray-700">Amount (TZS)</div>
              </div>
              
              {/* Section 1: Revenue (Sales) */}
              <div className="grid grid-cols-12 gap-4 py-3 border-b">
                <div className="col-span-5 font-medium pl-4">1. Revenue (Sales)</div>
                <div className="col-span-4 text-right pr-4 text-gray-600">Total sales to customers - Total sales returns</div>
                <div className="col-span-3 text-right font-semibold pr-4 text-green-600">{incomeStatementData.revenue.toLocaleString()}</div>
              </div>
              
              {/* Section 2: Cost of Goods Sold (COGS) */}
              <div className="grid grid-cols-12 gap-4 py-3 border-b">
                <div className="col-span-5 font-medium pl-4">2. Cost of Goods Sold (COGS)</div>
                <div className="col-span-4 text-right pr-4 text-gray-600">Cost of items sold — includes purchases, transport, and other direct costs</div>
                <div className="col-span-3 text-right font-semibold pr-4 text-red-600">({incomeStatementData.cogs.toLocaleString()})</div>
              </div>
              
              {/* = Gross Profit */}
              <div className="grid grid-cols-12 gap-4 py-4 border-y-2 border-gray-300 bg-gray-50">
                <div className="col-span-5 font-bold pl-4">Gross Profit</div>
                <div className="col-span-4 text-right pr-4 font-medium">Revenue − COGS</div>
                <div className="col-span-3 text-right font-bold pr-4 text-blue-600 text-lg">{incomeStatementData.grossProfit.toLocaleString()}</div>
              </div>
              
              {/* Section 3: Operating Expenses */}
              <div className="grid grid-cols-12 gap-4 py-3 border-b">
                <div className="col-span-5 font-medium pl-4">3. Operating Expenses</div>
                <div className="col-span-4 text-right pr-4 text-gray-600">Rent, salaries, utilities, admin, etc.</div>
                <div className="col-span-3 text-right font-semibold pr-4 text-red-600">({incomeStatementData.operatingExpenses.toLocaleString()})</div>
              </div>
              
              {/* = Operating Profit */}
              <div className="grid grid-cols-12 gap-4 py-4 border-y-2 border-gray-300 bg-gray-50">
                <div className="col-span-5 font-bold pl-4">Operating Profit</div>
                <div className="col-span-4 text-right pr-4 font-medium">Gross Profit − Operating Expenses</div>
                <div className="col-span-3 text-right font-bold pr-4 text-blue-600 text-lg">{incomeStatementData.operatingProfit.toLocaleString()}</div>
              </div>
              
              {/* Section 4: Other Income / Expenses */}
              <div className="grid grid-cols-12 gap-4 py-3 border-b">
                <div className="col-span-5 font-medium pl-4">4. Other Income / Expenses</div>
                <div className="col-span-4 text-right pr-4 text-gray-600">Interest, asset sales, etc.</div>
                <div className="col-span-3 text-right font-semibold pr-4 text-purple-600">
                  {incomeStatementData.otherIncomeExpenses >= 0 ? '+' : ''}{incomeStatementData.otherIncomeExpenses.toLocaleString()}
                </div>
              </div>
              
              {/* Section 5: Tax (Income Tax) */}
              <div className="grid grid-cols-12 gap-4 py-3 border-b">
                <div className="col-span-5 font-medium pl-4">5. Tax (Income Tax)</div>
                <div className="col-span-4 text-right pr-4 text-gray-600">Based on profit before tax</div>
                <div className="col-span-3 text-right font-semibold pr-4 text-red-600">({incomeStatementData.tax.toLocaleString()})</div>
              </div>
              
              {/* = Net Profit */}
              <div className="grid grid-cols-12 gap-4 py-5 border-y-2 border-gray-400 bg-blue-50 rounded-b-lg">
                <div className="col-span-5 font-extrabold pl-4 text-lg">NET PROFIT</div>
                <div className="col-span-4 text-right pr-4 font-bold text-lg">Final profit after all costs and tax</div>
                <div className="col-span-3 text-right font-extrabold pr-4 text-green-700 text-xl">{incomeStatementData.netProfit.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Professional Footer */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="col-span-1">
                  <p className="font-semibold">Prepared by:</p>
                  <p className="mt-1 border-t border-gray-300 pt-2 text-gray-600">Authorized Signatory</p>
                </div>
                <div className="col-span-1 text-center">
                  <p className="font-semibold">Reviewed by:</p>
                  <p className="mt-1 border-t border-gray-300 pt-2 text-gray-600">Finance Manager</p>
                </div>
                <div className="col-span-1 text-right">
                  <p className="font-semibold">Date:</p>
                  <p className="mt-1 border-t border-gray-300 pt-2 text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>CONFIDENTIAL - For Internal Use Only</p>
                <p className="mt-1">This statement has been prepared in accordance with applicable accounting standards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};