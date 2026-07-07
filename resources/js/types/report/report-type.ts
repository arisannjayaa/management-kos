export type ReportFilters = {
    property_id?: string;
    year?: number;
    month?: number;
};

export type ChartData = {
    name: string;
    income: number;
    expense: number;
    profit: number;
};

export type FinancialSummary = {
    current_income: number;
    current_expense: number;
    current_profit: number;
    last_income: number;
    last_expense: number;
    last_profit: number;
};

export type FinancialData = {
    summary: FinancialSummary;
    chart: ChartData[];
};
