import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, LabelList } from 'recharts';
import { Upload, DollarSign, Percent, TrendingUp, CheckCircle, Home, ListChecks, RefreshCw, AlertCircle, CalendarDays, FileDown, Ruler, PlusCircle, MinusCircle, ArrowDownUp, LandPlot } from 'lucide-react';

// --- CONFIGURAÇÃO CENTRALIZADA ---
const CONFIG = {
    financeiro: {
        ID: 'ID',
        ORCADO: 'ORÇADO',
        PAGO: 'PAGO',
        A_PAGAR: 'A PAGAR',
        COMPROMETIDO: 'COMPROMETIDO',
        CUSTO_AO_TERMINO: 'CUSTO AO TERMINO',
        ESTOURO_ECONOMIA: 'ESTOURO/ECONOMIA',
        SERVICO_PRINCIPAL: 'SERVIÇO',
        GASTO_MES_DATA: 'Rótulos de Linha',
        GASTO_MES_VALOR: 'TOTAL PAGO ',
        ESTOQUE_DATA: 'ESTOQUE',
        ESTOQUE_VALOR: 'Valor',
        FINANCIAMENTO_DATA: 'FINANCIAMENTO',
        FINANCIAMENTO_VALOR_MENSAL: 'Valor Mensal',
        FINANCIAMENTO_VALOR_ACUMULADO: 'Valor Acumulado',
        CUSTO_APLICADO_DATA: 'DATA',
        CUSTO_APLICADO_DIRETO: 'CUSTO DIRETO',
        CUSTO_APLICADO_INDIRETO: 'CUSTO INDIRETO',
        CUSTO_APLICADO_INCORPORACAO: 'CUSTO INCORPORAÇÃO',
        FATURAMENTO_DIRETO_DATA: 'MES RECEBIMENTO',
        FATURAMENTO_DIRETO_VALOR: 'VALOR RECEBIMENTO',
        SERVICO_EXEC_DATA: 'servicodata',
        SERVICO_EXEC_NOME: 'Servicoexec',
        SERVICO_EXEC_QTD: 'qtd',
        SERVICO_EXEC_ORCADO: 'valorexecorc',
        SERVICO_EXEC_GASTO: 'valorgastoexec',
    },
    evolucao: {
        MES_REFERENCIA: 'Mês Referencia',
        EXECUTADO_MENSAL: 'Executado Mensal',
        BASELINE_MENSAL: 'BASE LINE Mensal',
        EXECUTADO_ACUMULADO: 'Executado Acumulado',
        BASELINE_ACUMULADO: 'BASE LINE Acumulado',
        PROJETADO_MENSAL: 'PROJETADO Mensal',
        PROJETADO_ACUMULADO: 'PROJETADO Acumulado',
    },
    vendasEspelho: {
        UNIDADE_ID: 'Und',
        POSICAO_PREFIX: 'Posicao',
        VALOR_PREFIX: 'Valor',
    },
    vendasInadimplentes: {
        MES_REFERENCIA: 'mes referencia',
        CLIENTE: 'Cliente',
        UNIDADE_PRINCIPAL: 'Unid. princ',
        DIAS_ATRASO: 'Dias',
        VALOR_TOTAL: 'Total',
    },
    pls: {
        COD: 'cod',
        SERVICO: 'servico',
        VALORES_TOTAIS: 'valores',
        PESO_ORCAMENTO: 'peso global',
        QUANTIDADE: 'quantidade',
        UNIDADE: 'unidade',
        CUSTO_TOTAL: 'total',
        PERIODO_SERVICO: 'periodo servico',
        ACUMULADO: 'acumulado',
        GLOBAL_OBRA: 'global obra',
        MEDICAO: 'medicao',
    }
};

const initialData = {
    summaryData: { viabilidade: 0, custoTotal: 0, gastoMes: 0, evolucaoMensal: { realizado: 0, baseline: 0, projetado: 0 }, analiseEvolucao: { baselineFisico: 0, realizadoFisico: 0, realizadoFinanceiro: 0 }, vendas: { vendidas: 0, total: 0 }, previsaoFimReal: 'N/D', previsaoFimBaseline: 'N/D', projectInfo: { area: 9292.69, viabilidadeM2: 3515, orcamentoM2: 2572.21 }, custoObra: 0, custoAdmin: 0, custoIncorporacao: 0 },
    financeiroData: { cards: { orcamento: 0, custoTotalHoje: 0, aPagar: 0, comprometido: 0, economia: 0, materiaisEstoque: 0, totalLiberadoCaixa: 0, valorMensalCaixa: 0, faturamentoDiretoMes: 0, faturamentoDiretoAcumulado: 0, recebimentoTotalMes: 0, recebimentoTotalAcumulado: 0 }, detalhesCustos: [] },
    evolucaoData: { evolucaoMes: { previsto: 0, realizado: 0 }, curvaS: [], deltaGlobal: 0, avgDeltaReal: 0, avgDeltaBaseline: 0,avgDeltaPlanejado: 0, avgDeltaProjetado: 0 },
    custoAplicadoData: { custoDireto: 0, custoIndireto: 0, custoIncorporacao: 0, custoExecucao: 0, custoTotalAplicado: 0, gastoMes: 0, valorMensalCaixa: 0, recebimentoTotalMes: 0, servicosDoMes: [] },
    vendasData: { unidades: [], unidadesVendidas: 0, unidadesEstoque: 0, valorEstoque: 0, receitas: { recebido: 0, aReceber: 0 }, inadimplentes: [], unidadesPermuta: 0, vgvTotal: 0, variacaoEstoqueUnidades: 0, variacaoEstoqueValor: 0, variacaoEstoquePercent: 0, precoMedioVendaMes: 0, variacaoInadimplenciaValor: 0, variacaoInadimplenciaPercent: 0 },
    medCefPlsData: { services: [], totalsData: { valoresTotais: 0, periodoServico: 0, acumulado: 0, globalObra: 0, medicao: 0 } }
};

const getUTCDate = (inputDate) => {
    if (!inputDate) return null;
    if (inputDate instanceof Date) {
        if (isNaN(inputDate.getTime())) return null;
        const year = inputDate.getUTCFullYear();
        const month = inputDate.getUTCMonth();
        const day = inputDate.getUTCDate();
        return new Date(Date.UTC(year, month, day, 12, 0, 0));
    }
    if (typeof inputDate === 'number') {
        const d = new Date(Date.UTC(1899, 11, 30 + inputDate, 12, 0, 0));
        if (isNaN(d.getTime())) return null;
        return d;
    }
    if (typeof inputDate === 'string') {
        const trimmed = inputDate.trim();
        const monthMap = { 'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11 };
        const parts = trimmed.toLowerCase().replace('.', '').split('/');
        if (parts.length === 2 && monthMap[parts[0]] !== undefined) {
            const year = parseInt(parts[1], 10);
            const fullYear = year < 100 ? 2000 + year : year;
            const month = monthMap[parts[0]];
            return new Date(Date.UTC(fullYear, month, 1, 12, 0, 0));
        }
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) {
            const year = d.getUTCFullYear();
            const month = d.getUTCMonth();
            const day = d.getUTCDate();
            return new Date(Date.UTC(year, month, day, 12, 0, 0));
        }
    }
    return null;
};

const useChartReady = () => {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => { const timer = setTimeout(() => setIsReady(true), 100); return () => clearTimeout(timer); }, []);
    return isReady;
};

const COLORS = { blue: '#3b82f6', sky: '#0ea5e9', green: '#22c55e', amber: '#f59e0b', red: '#ef4444', gray: '#a1a1aa', lightGray: '#f3f4f6', darkGray: '#6b7280', darkBlue: '#1e3a8a', darkGreen: '#15803d' };

const Card = ({ title, value, icon, color, smallText, size = 'md' }) => {
    const isSmall = size === 'sm';
    return (
        <div className={`bg-white rounded-xl shadow-md flex-1 min-w-[160px] ${isSmall ? 'p-2' : 'p-4'}`}>
            <div className={`flex items-center ${isSmall ? 'space-x-1' : 'space-x-2'}`}>
                {icon}
                <h3 className={`font-semibold text-gray-500 ${isSmall ? 'text-xs' : 'text-sm'}`}>{title}</h3>
            </div>
            <div className={`font-bold mt-1 whitespace-nowrap ${color || 'text-gray-800'} ${isSmall ? 'text-lg' : 'text-2xl'}`}>{value}</div>
            {smallText && <p className={`text-gray-400 mt-1 ${isSmall ? 'text-xs' : 'text-xs'}`}>{smallText}</p>}
        </div>
    );
};

const Modal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
            <p className="mb-4">{message}</p>
            <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Fechar</button>
        </div>
    </div>
);

const CircularGauge = ({ percentage = 0, title, color = COLORS.blue }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h3 className="font-bold text-gray-600 mb-2 uppercase">{title}</h3>
            <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r={radius} stroke={COLORS.lightGray} strokeWidth="12" fill="transparent" />
                <circle cx="60" cy="60" r={radius} stroke={color} strokeWidth="12" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="22" fontWeight="bold" fill={COLORS.darkGray} className="rotate-90 origin-center">
                    {`${percentage.toFixed(1)}%`}
                </text>
            </svg>
        </div>
    );
};

// --- PÁGINAS DO DASHBOARD ---
const ResumoPage = ({ data }) => {
    const { summaryData, vendasData } = data;
    const { viabilidade, custoTotal, gastoMes, analiseEvolucao, vendas, custoObra, custoAdmin, custoIncorporacao } = summaryData;
    const formatOptions = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const getArea = (unitId) => {
        const lastTwo = unitId % 100;
        if ([1, 2, 7, 8].includes(lastTwo)) return 52.2;
        if (lastTwo === 3) return 51.84;
        if ([4, 6].includes(lastTwo)) return 50.85;
        if (lastTwo === 5) return 51.48;
        return 0;
    };
    const { totalApartmentAreaMinusPermuta, totalApartmentArea, avgPricePerM2Sold } = React.useMemo(() => {
        let minusPermuta = 0;
        let totalArea = 0;
        let sumTotalSold = 0;
        let sumAreaSold = 0;
        if (vendasData && vendasData.unidades) {
            vendasData.unidades.forEach(apt => {
                const area = getArea(apt[CONFIG.vendasEspelho.UNIDADE_ID]);
                totalArea += area; // Inclui TODOS os apartamentos (com e sem permuta)
                if (!(apt.Posicao && apt.Posicao.toUpperCase() === 'PERMUTA')) {
                    minusPermuta += area;
                }
                if (apt.Posicao && apt.Posicao.toUpperCase() === 'VENDIDO' && apt.Total) {
                    sumTotalSold += apt.Total;
                    sumAreaSold += area;
                }
            });
        }
        const avgPricePerM2Sold = sumAreaSold > 0 ? sumTotalSold / sumAreaSold : 0;
        return { totalApartmentAreaMinusPermuta: minusPermuta, totalApartmentArea: totalArea, avgPricePerM2Sold };
    }, [vendasData]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                <Card title="Viabilidade" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(viabilidade)}`} icon={<DollarSign className="text-green-500" />} color="text-green-600" />
                <Card title="Custo Incorrido" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoTotal)}`} icon={<TrendingUp className="text-blue-500" />} color="text-blue-600" />
                <Card title="Gasto no Mês" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(gastoMes)}`} icon={<DollarSign className="text-amber-500" />} color="text-amber-600" />
                <Card title="Unidades Vendidas" value={`${vendas.vendidas} de ${vendas.total}`} icon={<CheckCircle className="text-indigo-500" />} color="text-indigo-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Custo de Obra" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoObra)}`} icon={<Ruler className="text-blue-500" />} color="text-blue-600" />
                <Card title="Custo Administração" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoAdmin)}`} icon={<Ruler className="text-sky-500" />} color="text-sky-600" />
                <Card title="Custo Incorporação" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoIncorporacao)}`} icon={<Ruler className="text-indigo-500" />} color="text-indigo-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                    title="Área Construída M²" 
                    value={
                        <div className="space-y-1 text-sm">
                            <div>Área Construída: {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summaryData.projectInfo.area)} m²</div>
                            <div>Área Apartamentos: {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalApartmentArea)} m²</div>
                            <div>Área Comum: {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summaryData.projectInfo.area - totalApartmentArea)} m²</div>
                        </div>
                    }
                    icon={<Ruler className="text-blue-500" />} 
                    color="text-blue-600" 
                />
                <Card 
                    title="Viabilidade R$/M²" 
                    value={
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-medium mb-1">Área Construída</div>
                                <div><span className="text-gray-500">Meta:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.viabilidade / summaryData.projectInfo.area)}</div>
                                <div><span className="text-gray-500">Gasto:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.custoTotal / summaryData.projectInfo.area)}</div>
                                <div><span className="text-gray-500">Comprometido:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.comprometidoGlobal / summaryData.projectInfo.area)}</div>
                            </div>
                            <div>
                                <div className="font-medium mb-1">Área Apartamentos</div>
                                <div><span className="text-gray-500">Meta:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.viabilidade / totalApartmentArea)}</div>
                                <div><span className="text-gray-500">Gasto:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.custoTotal / totalApartmentArea)}</div>
                                <div><span className="text-gray-500">Comprometido:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.comprometidoGlobal / totalApartmentArea)}</div>
                            </div>
                        </div>
                    }
                    icon={<Ruler className="text-sky-500" />} 
                    color="text-sky-600" 
                />
                <Card 
                    title="Orçamento R$/M²" 
                    value={
                    <div className="space-y-1 text-sm">
                        <div><span className="text-gray-500 font-medium">Meta:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(initialData.summaryData.projectInfo.orcamentoM2)}</div>
                        <div><span className="text-gray-500 font-medium">Gasto:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.pagoObra / summaryData.projectInfo.area)}</div>
                        <div><span className="text-gray-500 font-medium">Comprometido:</span> R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(summaryData.comprometidoObra / summaryData.projectInfo.area)}</div>
                    </div>
                }
                    icon={<Ruler className="text-indigo-500" />} 
                    color="text-indigo-600" 
                />
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Comparação Custo x Preço Médio de Venda (R$/m²)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card title="Preço Médio Vendido" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(avgPricePerM2Sold)}`} icon={<DollarSign className="text-green-500" />} />
                    <Card title="Lucro m² (Meta)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(avgPricePerM2Sold - (summaryData.viabilidade / totalApartmentArea))}`} icon={<TrendingUp className="text-blue-500" />} color={avgPricePerM2Sold - (summaryData.viabilidade / totalApartmentArea) >= 0 ? 'text-green-500' : 'text-red-500'} smallText={`${((avgPricePerM2Sold - (summaryData.viabilidade / totalApartmentArea)) / (summaryData.viabilidade / totalApartmentArea) * 100).toFixed(2)}% do custo`} />
                    <Card title="Diferença Gasto" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(avgPricePerM2Sold - (summaryData.custoTotal / totalApartmentArea))}`} icon={<DollarSign className="text-amber-500" />} color={avgPricePerM2Sold - (summaryData.custoTotal / totalApartmentArea) >= 0 ? 'text-green-500' : 'text-red-500'} />
                    <Card title="Diferença Comprometido" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(avgPricePerM2Sold - (summaryData.comprometidoGlobal / totalApartmentArea))}`} icon={<AlertCircle className="text-red-500" />} color={avgPricePerM2Sold - (summaryData.comprometidoGlobal / totalApartmentArea) >= 0 ? 'text-green-500' : 'text-red-500'} smallText={`${((avgPricePerM2Sold - (summaryData.comprometidoGlobal / totalApartmentArea)) / (summaryData.comprometidoGlobal / totalApartmentArea) * 100).toFixed(2)}% do custo`} />
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Análise de Evolução (Acumulado no Mês de Referência)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CircularGauge title="BASE LINE" percentage={analiseEvolucao.baselineFisico} color={COLORS.darkGray} />
                    <CircularGauge title="EVOLUÇÃO FÍSICA" percentage={analiseEvolucao.realizadoFisico} color={COLORS.blue} />
                    <CircularGauge title="EVOLUÇÃO FINANCEIRA" percentage={analiseEvolucao.realizadoFinanceiro} color={COLORS.green} />
                </div>
            </div>
        </div>
    );
};

const FinanceiroPage = ({ data, viewType, setViewType, printMode = false }) => {
    const { financeiroData } = data;
    const { cards, detalhesCustos } = financeiroData;
    const parseCurrency = (value) => { if (typeof value !== 'string' && typeof value !== 'number') return 0; if (typeof value === 'number') return value; return parseFloat(String(value).replace("R$", "").trim().replace(/\./g, "").replace(",", ".")) || 0; };
    const formatOptions = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const itensDeCustoReais = React.useMemo(() => detalhesCustos.filter(row => row && row[CONFIG.financeiro.ID]), [detalhesCustos]);
    const renderView = (currentViewType) => {
        const dataToDisplay = currentViewType === 'obra'
            ? itensDeCustoReais.filter(row => String(row[CONFIG.financeiro.ID] || '').trim().startsWith('1'))
            : itensDeCustoReais;
        const visaoCalculada = {
            orcado: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.ORCADO]), 0),
            pago: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.PAGO]), 0),
            comprometido: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.COMPROMETIDO]), 0),
            economia: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.ESTOURO_ECONOMIA]), 0),
            pagoHoje: currentViewType === 'obra' ? dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.PAGO]), 0) : cards.custoTotalHoje,
        };
        visaoCalculada.comprometidoPercent = visaoCalculada.orcado > 0 ? (visaoCalculada.comprometido / visaoCalculada.orcado) * 100 : 0;
        visaoCalculada.estouroPercent = (visaoCalculada.orcado - visaoCalculada.economia) > 0 ? (visaoCalculada.economia / (visaoCalculada.orcado - visaoCalculada.economia)) * -100 : 0;
        const estoquePercent = visaoCalculada.orcado > 0 ? (cards.materiaisEstoque / visaoCalculada.orcado) * 100 : 0;
        const totaisTabela = {
            orcado: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.ORCADO]), 0),
            pago: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.PAGO]), 0),
            aPagar: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.A_PAGAR]), 0),
            comprometido: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.COMPROMETIDO]), 0),
            custoAoTermino: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.CUSTO_AO_TERMINO]), 0),
            economia: dataToDisplay.reduce((sum, item) => sum + parseCurrency(item[CONFIG.financeiro.ESTOURO_ECONOMIA]), 0),
        };
        return (
            <div className="space-y-6">
                {printMode && <h3 className="text-xl font-bold text-gray-800 pt-4 print:pt-0">Visão: {currentViewType === 'global' ? 'Valor Global' : 'Valor de Obra'}</h3>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card title={`ORÇAMENTO (${currentViewType === 'global' ? 'Global' : 'Obra'})`} value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(visaoCalculada.orcado)}`} />
                    <Card title="PAGO ATÉ HOJE" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(visaoCalculada.pagoHoje)}`} />
                    <Card title="A PAGAR (Global)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.aPagar)}`} color="text-amber-600" />
                    <Card title="COMPROMETIDO" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(visaoCalculada.comprometido)}`} color="text-blue-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card title="Materiais em Estoque" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.materiaisEstoque)}`} color="text-green-600" smallText={`Representa ${estoquePercent.toFixed(2)}% do orçamento`} />
                    <Card title="Liberado Caixa (Mês Ref.)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.valorMensalCaixa)}`} color="text-teal-600" smallText="Financiamento Bancário" />
                    <Card title="Liberado Caixa (Acum.)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.totalLiberadoCaixa)}`} color="text-emerald-600" smallText="Financiamento Bancário" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card title="Faturamento Direto (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.faturamentoDiretoMes)}`} icon={<DollarSign className="text-cyan-500" />} color="text-cyan-600" />
                    <Card title="Faturamento Direto (Acum.)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.faturamentoDiretoAcumulado)}`} icon={<DollarSign className="text-cyan-700" />} color="text-cyan-700" />
                    <Card title="Recebimento Total (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.recebimentoTotalMes)}`} icon={<TrendingUp className="text-green-500" />} color="text-green-600" smallText="Caixa + Faturamento Direto" />
                    <Card title="Recebimento Total (Acum.)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(cards.recebimentoTotalAcumulado)}`} icon={<TrendingUp className="text-green-700" />} color="text-green-700" smallText="Caixa + Faturamento Direto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <Card title="ORÇAMENTO COMPROMETIDO" value={`${(visaoCalculada.comprometidoPercent || 0).toFixed(2)} %`} icon={<Percent className="text-blue-500" />} smallText={`Ref. ao Orçamento (${currentViewType})`} />
                    <Card title="ESTOURO / ECONOMIA" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(visaoCalculada.economia || 0)}`} icon={<Percent className={(visaoCalculada.economia || 0) >= 0 ? "text-green-500" : "text-red-500"} />} color={(visaoCalculada.economia || 0) >= 0 ? "text-green-600" : "text-red-600"} smallText={`Percentual: ${(visaoCalculada.estouroPercent || 0).toFixed(2)} %`} />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="font-bold text-gray-700 mb-4">Detalhamento de Custos ({currentViewType === 'global' ? 'Global' : 'Obra'})</h3>
                    <div className="overflow-x-auto h-[55vh] print:h-auto print:overflow-visible">
                        <table className="w-full text-sm text-left table-auto">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th className="px-4 py-2">SERVIÇO</th><th className="px-4 py-2 text-right">ORÇADO</th><th className="px-4 py-2 text-right">PAGO</th><th className="px-4 py-2 text-right">A PAGAR</th><th className="px-4 py-2 text-right">COMPROMETIDO</th><th className="px-4 py-2 text-right">CUSTO AO TÉRMINO</th><th className="px-4 py-2 text-right">ESTOURO/ECONOMIA</th>
                            </tr></thead>
                            <tbody>
                                {dataToDisplay.map((item, index) => {
                                    const economia = parseCurrency(item[CONFIG.financeiro.ESTOURO_ECONOMIA]);
                                    return (<tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{item[CONFIG.financeiro.SERVICO_PRINCIPAL]}</td>
                                        <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(parseCurrency(item[CONFIG.financeiro.ORCADO]))}</td>
                                        <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(parseCurrency(item[CONFIG.financeiro.PAGO]))}</td>
                                        <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(parseCurrency(item[CONFIG.financeiro.A_PAGAR]))}</td>
                                        <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(parseCurrency(item[CONFIG.financeiro.COMPROMETIDO]))}</td>
                                        <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(parseCurrency(item[CONFIG.financeiro.CUSTO_AO_TERMINO]))}</td>
                                        <td className={`px-4 py-2 text-right font-bold ${economia >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(economia)}</td>
                                    </tr>);
                                })}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                <tr className="border-t-2 border-gray-300">
                                    <td className="px-4 py-2">TOTAIS</td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisTabela.orcado)}</td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisTabela.pago)}</td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisTabela.aPagar)}</td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisTabela.comprometido)}</td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisTabela.custoAoTermino)}</td>
                                    <td className={`px-4 py-2 text-right ${totaisTabela.economia >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisTabela.economia)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
    if (printMode) {
        return (
            <>
                {renderView('global')}
                <div className="page-break"></div>
                {renderView('obra')}
            </>
        );
    }
    return (
        <>
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-md w-fit print:hidden">
                <button onClick={() => setViewType('global')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewType === 'global' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}>Valor Global</button>
                <button onClick={() => setViewType('obra')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewType === 'obra' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}>Valor de Obra</button>
            </div>
            <div className="mt-6">{renderView(viewType)}</div>
        </>
    );
};

const EvolucaoPage = ({ data, isPrintMode }) => {
    const { evolucaoData, summaryData } = data;
    const { evolucaoMensal, previsaoFimBaseline, previsaoFimReal } = summaryData;
    const isReady = useChartReady();
    
    // Deltas em relação ao Baseline
    const deltaBaselineMensal = (evolucaoMensal.realizado || 0) - (evolucaoMensal.baseline || 0);
    const deltaBaselineGlobal = evolucaoData.deltaGlobal || 0;

    // Deltas em relação ao Projetado
    const deltaProjetadoMensal = evolucaoData.deltaMensalProjetado || 0;
    const deltaProjetadoGlobal = evolucaoData.deltaGlobalProjetado || 0;

    const evolucaoMesData = [{ 
        name: 'Evolução', 
        previsto: (evolucaoMensal.baseline || 0), 
        realizado: (evolucaoMensal.realizado || 0),
        projetado: (evolucaoMensal.projetado || 0)
    }];

    const renderCustomLabel = (props) => {
        const { x, y, width, height, value } = props;
        if (width < 35 || !value) return null;
        return (
            <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dy=".3em" fontSize="12px" fontWeight="bold">
                {`${value.toFixed(1)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Término (Baseline)" value={previsaoFimBaseline} icon={<CalendarDays className="text-gray-500" />} />
                <Card title="Término (Projetado)" value={previsaoFimReal} icon={<CalendarDays className="text-blue-500" />} />
                <Card
                    title="Executado no Mês"
                    value={`${(evolucaoMensal.realizado || 0).toFixed(2)}%`}
                    icon={<ListChecks className="text-blue-500" />}
                    color="text-blue-600"
                    smallText={`Baseline: ${(evolucaoMensal.baseline || 0).toFixed(2)}% | Projetado: ${(evolucaoMensal.projetado || 0).toFixed(2)}%`}
                />
            </div>
            {/* ATUALIZADO: Grid para os deltas */}
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Análise de Variação (Deltas)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card title="Delta Mensal (vs. Baseline)" value={`${deltaBaselineMensal >= 0 ? '+' : ''}${deltaBaselineMensal.toFixed(2)}%`} icon={<Percent className={deltaBaselineMensal >= 0 ? "text-green-500" : "text-red-500"} />} color={deltaBaselineMensal >= 0 ? "text-green-600" : "text-red-600"} smallText={deltaBaselineMensal >= 0 ? 'Adiantado no mês' : 'Atrasado no mês'} />
                    <Card title="Delta Global (vs. Baseline)" value={`${deltaBaselineGlobal >= 0 ? '+' : ''}${deltaBaselineGlobal.toFixed(2)}%`} icon={<Percent className={deltaBaselineGlobal >= 0 ? "text-green-500" : "text-red-500"} />} color={deltaBaselineGlobal >= 0 ? "text-green-600" : "text-red-600"} smallText={deltaBaselineGlobal >= 0 ? 'Obra adiantada' : 'Obra atrasada'} />
                    {/* NOVOS CARDS */}
                    <Card title="Delta Mensal (vs. Projetado)" value={`${deltaProjetadoMensal >= 0 ? '+' : ''}${deltaProjetadoMensal.toFixed(2)}%`} icon={<Percent className={deltaProjetadoMensal >= 0 ? "text-green-500" : "text-red-500"} />} color={deltaProjetadoMensal >= 0 ? "text-green-600" : "text-red-600"} smallText={deltaProjetadoMensal >= 0 ? 'Acima do projetado' : 'Abaixo do projetado'} />
                    <Card title="Delta Global (vs. Projetado)" value={`${deltaProjetadoGlobal >= 0 ? '+' : ''}${deltaProjetadoGlobal.toFixed(2)}%`} icon={<Percent className={deltaProjetadoGlobal >= 0 ? "text-green-500" : "text-red-500"} />} color={deltaProjetadoGlobal >= 0 ? "text-green-600" : "text-red-600"} smallText={deltaProjetadoGlobal >= 0 ? 'Obra adiantada' : 'Obra atrasada'} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Média Prevista (Baseline)" value={`${evolucaoData.avgDeltaBaseline.toFixed(2)}% / mês`} icon={<TrendingUp className="text-gray-500" />} />
                <Card title="Média Realizada (Passado)" value={`${evolucaoData.avgDeltaReal.toFixed(2)}% / mês`} icon={<TrendingUp className="text-blue-500" />} />
                <Card title="Ritmo Planejado (Projeção)" value={`${evolucaoData.avgDeltaPlanejado.toFixed(2)}% / mês`} icon={<TrendingUp className="text-sky-500" />} />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Evolução no Mês de Referência</h3>
                <div style={{ width: '100%', height: 200 }}>
                    {isReady && <ResponsiveContainer><BarChart data={evolucaoMesData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }} isAnimationActive={!isPrintMode}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax + 2']} tickFormatter={(tick) => `${tick.toFixed(1)}%`} />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                        <Legend />
                        <Bar dataKey="previsto" name="Base (Previsto)" fill={COLORS.gray}>
                            <LabelList dataKey="previsto" content={renderCustomLabel} />
                        </Bar>
                        <Bar dataKey="projetado" name="Projetado" fill={COLORS.darkGreen}>
                            <LabelList dataKey="projetado" content={renderCustomLabel} />
                        </Bar>
                        <Bar dataKey="realizado" name="Executado (Real)" fill={COLORS.blue}>
                            <LabelList dataKey="realizado" content={renderCustomLabel} />
                        </Bar>
                    </BarChart></ResponsiveContainer>}
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Curva S - Evolução Acumulada</h3>
                <div style={{ width: '100%', height: 450 }}>
                    {isReady && <ResponsiveContainer>
                        <ComposedChart data={evolucaoData.curvaS} margin={{ top: 5, right: 20, left: 20, bottom: 60 }} isAnimationActive={!isPrintMode}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" interval={0} angle={-60} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
                            <YAxis yAxisId="left" tickFormatter={(t) => `${t}%`} label={{ value: 'Evolução Mensal', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={(t) => `${t}%`} label={{ value: 'Evolução Acumulada', angle: 90, position: 'insideRight' }} />
                            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                            <Legend verticalAlign="top" />
                            <Bar yAxisId="left" dataKey="projetado" name="Projetado Mensal" fill={COLORS.darkGreen} />
                            <Bar yAxisId="left" dataKey="realizado" name="Realizado Mensal" fill={COLORS.blue} />
                            <Bar yAxisId="left" dataKey="baseline" name="Baseline Mensal" fill={COLORS.gray} />
                            <Line yAxisId="right" type="monotone" dataKey="projetadoAcc" name="Projetado Acumulado" stroke={COLORS.darkGreen} strokeWidth={2} strokeDasharray="2 2" dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="realizadoAcc" name="Realizado Acumulado" stroke={COLORS.darkBlue} strokeWidth={2} dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="baselineAcc" name="Baseline Acumulado" stroke={COLORS.red} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>}
                </div>
            </div>
        </div>
    );
};

const CustoAplicadoPage = ({ data }) => {
    const { custoAplicadoData } = data;
    const { custoDireto, custoIndireto, custoIncorporacao, custoExecucao, custoTotalAplicado, gastoMes, valorMensalCaixa, recebimentoTotalMes, servicosDoMes } = custoAplicadoData;
    const formatOptions = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const deltaExecucao = recebimentoTotalMes - custoExecucao;
    const deltaTotalAplicado = recebimentoTotalMes - custoTotalAplicado;
    const deltaGastoMes = recebimentoTotalMes - gastoMes;
    const totaisServicos = React.useMemo(() => {
        if (!servicosDoMes) return { totalOrcado: 0, custoReal: 0, resultado: 0 };
        return servicosDoMes.reduce((acc, item) => {
            acc.totalOrcado += item.totalOrcado;
            acc.custoReal += item.custoReal;
            acc.resultado += item.resultado;
            return acc;
        }, { totalOrcado: 0, custoReal: 0, resultado: 0 });
    }, [servicosDoMes]);
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Custo Direto (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoDireto)}`} color="text-blue-600" />
                <Card title="Custo Indireto (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoIndireto)}`} color="text-sky-600" />
                <Card title="Custo Incorporação (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoIncorporacao)}`} color="text-indigo-600" />
                <Card title="Gasto no Mês" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(gastoMes)}`} color="text-amber-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Custo de Execução (Direto+Indireto)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoExecucao)}`} />
                <Card title="Custo Total Aplicado no Mês" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(custoTotalAplicado)}`} />
                <Card title="Liberado Caixa (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(valorMensalCaixa)}`} color="text-teal-600" />
                <Card title="Recebimento Total (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(recebimentoTotalMes)}`} color="text-emerald-600" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4 text-lg">Análise Comparativa (Recebimento Total vs. Custos do Mês)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        title="Resultado (vs. Custo de Execução)"
                        value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(deltaExecucao)}`}
                        color={deltaExecucao >= 0 ? "text-green-600" : "text-red-600"}
                        smallText={deltaExecucao >= 0 ? "Recebido vs. Execução" : "Recebido vs. Execução"}
                    />
                    <Card
                        title="Resultado (vs. Gasto no Mês)"
                        value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(deltaGastoMes)}`}
                        color={deltaGastoMes >= 0 ? "text-green-600" : "text-red-600"}
                        smallText={deltaGastoMes >= 0 ? "Recebido vs. Gasto" : "Recebido vs. Gasto"}
                    />
                    <Card
                        title="Resultado (vs. Custo Total Aplicado)"
                        value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(deltaTotalAplicado)}`}
                        color={deltaTotalAplicado >= 0 ? "text-green-600" : "text-red-600"}
                        smallText={deltaTotalAplicado >= 0 ? "Recebido vs. Custo Aplicado" : "Recebido vs. Custo Aplicado"}
                    />
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4 text-lg">Análise de Serviços do Mês</h3>
                <div className="overflow-x-auto h-[60vh] print:h-auto print:overflow-visible">
                    <table className="w-full text-sm text-left table-auto">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Serviço</th>
                                <th className="px-4 py-2 text-center">Qtd.</th>
                                <th className="px-4 py-2 text-right">Total Orçado</th>
                                <th className="px-4 py-2 text-right">Custo Real</th>
                                <th className="px-4 py-2 text-right">Resultado (Lucro/Prejuízo)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servicosDoMes && servicosDoMes.map((item, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{item.servico}</td>
                                    <td className="px-4 py-2 text-center">{item.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(item.totalOrcado)}</td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(item.custoReal)}</td>
                                    <td className={`px-4 py-2 text-right font-bold ${item.resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(item.resultado)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold">
                            <tr className="border-t-2 border-gray-300">
                                <td className="px-4 py-2" colSpan="2">TOTAIS</td>
                                <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisServicos.totalOrcado)}</td>
                                <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisServicos.custoReal)}</td>
                                <td className={`px-4 py-2 text-right ${totaisServicos.resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totaisServicos.resultado)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MedCefPlsPage = ({ data }) => {
    const { medCefPlsData } = data;

    const [expandedParents, setExpandedParents] = useState({});

    useEffect(() => {
        const initialState = {};
        medCefPlsData.services.forEach(service => {
            const cod = String(service.cod || '');
            const parts = cod.split('.');
            if (parts.length > 1) {
                const parentCod = parts.slice(0, -1).join('.');
                if (!initialState[parentCod]) {
                    initialState[parentCod] = false;
                }
            }
        });
        setExpandedParents(initialState);
    }, [medCefPlsData.services]);

    const toggleParent = React.useCallback((parentCod) => {
        setExpandedParents(prev => ({ ...prev, [parentCod]: !prev[parentCod] }));
    }, []);

    const sortedServices = React.useMemo(() => {
        return [...medCefPlsData.services].sort(sortByCode);
    }, [medCefPlsData.services]);

    const groupedServices = React.useMemo(() => {
        const groups = {};
        sortedServices.forEach(service => {
            const cod = String(service.cod || '');
            if (!groups[cod]) {
                groups[cod] = { parent: service, children: [] };
            } else {
                groups[cod].parent = service;
            }
            const parts = cod.split('.');
            if (parts.length > 1) {
                const parentCod = parts.slice(0, -1).join('.');
                if (!groups[parentCod]) {
                    groups[parentCod] = { parent: null, children: [] };
                }
                groups[parentCod].children.push(service);
            }
        });
        // Calculate parent values based on children
        Object.keys(groups).forEach(parentCod => {
            const group = groups[parentCod];
            if (group.children.length > 0 && group.parent) {
                const totalPeso = group.children.reduce((sum, child) => sum + (child.pesoOrcamento || 0), 0);
                if (totalPeso > 0) {
                    group.parent.pesoOrcamento = totalPeso;
                    group.parent.periodoServico = group.children.reduce((sum, child) => sum + (child.periodoServico || 0) * (child.pesoOrcamento || 0), 0) / totalPeso;
                    group.parent.acumulado = group.children.reduce((sum, child) => sum + (child.acumulado || 0) * (child.pesoOrcamento || 0), 0) / totalPeso;
                    group.parent.globalObra = group.children.reduce((sum, child) => sum + (child.globalObra || 0) * (child.pesoOrcamento || 0), 0) / totalPeso;
                    group.parent.medicao = group.children.reduce((sum, child) => sum + (child.medicao || 0), 0);
                }
            }
        });
        return groups;
    }, [sortedServices]);

    const buildRows = (parentCod, level = 0) => {
        const rows = [];
        const group = groupedServices[parentCod];
        if (group && group.parent) {
            const childCount = group.children.length;
            rows.push({
                ...group.parent,
                isParent: true,
                parentCod,
                childCount,
                displayName: '  '.repeat(level) + group.parent.servico,
                valueToShow: group.parent.valoresTotais,
                level
            });
            if (expandedParents[parentCod]) {
                group.children.forEach(child => {
                    const childCod = child.cod;
                    const childGroup = groupedServices[childCod];
                    if (childGroup && childGroup.children.length > 0) {
                        // child is also a parent
                        rows.push(...buildRows(childCod, level + 1));
                    } else {
                        rows.push({
                            ...child,
                            isParent: false,
                            parentCod,
                            childCount: 0,
                            displayName: '  '.repeat(level + 1) + child.servico,
                            valueToShow: child.custoTotal,
                            level: level + 1
                        });
                    }
                });
            }
        }
        return rows;
    };

    const visibleServices = React.useMemo(() => {
        const rows = [];
        sortedServices.forEach(service => {
            const cod = String(service.cod || '');
            const parts = cod.split('.');
            if (parts.length === 1) {
                rows.push(...buildRows(cod, 0));
            }
        });
        return rows;
    }, [groupedServices, expandedParents]);

    const totals = React.useMemo(() => {
        // Return totals from spreadsheet
        return {
            valoresTotais: medCefPlsData.totalsData?.valoresTotais || 0,
            pesoOrcamento: 0,
            periodoServico: medCefPlsData.totalsData?.periodoServico || 0,
            acumulado: medCefPlsData.totalsData?.acumulado || 0,
            globalObra: medCefPlsData.totalsData?.globalObra || 0,
            medicao: medCefPlsData.totalsData?.medicao || 0
        };
    }, [medCefPlsData.totalsData]);

    const formatOptions = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };

    const chartData = React.useMemo(() => {
        // Prepare data for chart - use only parent services
        return sortedServices
            .filter(service => !String(service.cod || '').includes('.'))
            .slice(0, 15)
            .map(service => ({
                name: `${service.cod} - ${service.servico}`.substring(0, 30),
                acumulado: Math.min(Number(service.acumulado || 0), 100),
                periodo: Math.min(Number(service.periodoServico || 0), 100)
            }));
    }, [sortedServices]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">PLS - CAIXA ECONÔMICA</h3>
                <div className="overflow-x-auto h-[69vh]">
                    <table className="w-full text-sm text-left table-auto">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Cód</th>
                                <th className="px-4 py-2">Serviço</th>
                                <th className="px-4 py-2 text-right">VALOR</th>
                                <th className="px-4 py-2 text-right">Peso (%)</th>
                                <th className="px-4 py-2 text-right">Período (%)</th>
                                <th className="px-4 py-2 text-right">Acumulado (%)</th>
                                <th className="px-4 py-2 text-right">Global (%)</th>
                                <th className="px-4 py-2 text-center">Visual</th>
                                <th className="px-4 py-2 text-right">Medição</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleServices.map((service, index) => (
                                <tr key={`${service.cod}-${index}`} className={`border-b ${service.isParent ? (service.level === 0 ? 'bg-blue-100' : 'bg-blue-50') : ''}`}>
                                    <td className="px-4 py-2 font-medium">{service.cod}</td>
                                    <td className="px-4 py-2 flex items-center">
                                        {service.isParent && service.childCount > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleParent(service.parentCod)}
                                                className="mr-2 w-7 h-7 rounded border border-gray-300 text-sm font-bold"
                                            >
                                                {expandedParents[service.parentCod] ? '-' : '+'}
                                            </button>
                                        ) : (
                                            <span className="inline-block w-7" />
                                        )}
                                        <span>{service.displayName}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(Number(service.valueToShow) || 0)}</td>
                                    <td className="px-4 py-2 text-right">{Number(service.pesoOrcamento || 0).toFixed(2)}%</td>
                                    <td className="px-4 py-2 text-right">{Number(service.periodoServico || 0).toFixed(2)}%</td>
                                    <td className="px-4 py-2 text-right">{Number(service.acumulado || 0).toFixed(2)}%</td>
                                    <td className="px-4 py-2 text-right">{Number(service.globalObra || 0).toFixed(2)}%</td>
                                    <td className="px-4 py-2">
                                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-blue-500"
                                                style={{ width: `${Math.min(Math.max(Number(service.acumulado || 0), 0), 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-gray-500 text-right mt-1">{Math.min(Number(service.acumulado || 0), 100).toFixed(2)}%</div>
                                    </td>
                                    <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(Number(service.medicao || 0))}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold">
                            <tr className="border-t-2 border-gray-300">
                                <td className="px-4 py-2" colSpan="2">TOTAIS</td>
                                <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totals.valoresTotais)}</td>
                                <td className="px-4 py-2 text-right"></td>
                                <td className="px-4 py-2 text-right">{totals.periodoServico.toFixed(2)}%</td>
                                <td className="px-4 py-2 text-right"></td>
                                <td className="px-4 py-2 text-right">{totals.globalObra.toFixed(2)}%</td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2 text-right">R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(totals.medicao)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            {chartData && chartData.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="font-bold text-gray-700 mb-4">Gráfico de Progresso por Serviço</h3>
                    <div className="w-full h-[500px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" width={240} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
                                <Legend />
                                <Bar dataKey="acumulado" fill="#3b82f6" name="Acumulado (%)" />
                                <Bar dataKey="periodo" fill="#10b981" name="Período (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

const VendasPage = ({ data }) => {
    const { vendasData } = data;
    const [expandedUnits, setExpandedUnits] = useState({});
    const formatOptions = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const toggleUnit = (unitId) => {
        setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
    };
    const inadimplentesAgrupados = React.useMemo(() => {
        if (!vendasData.inadimplentes) return [];
        const parseCurrency = (value) => parseFloat(String(value).replace(",", ".")) || 0;
        const grouped = vendasData.inadimplentes.reduce((acc, item) => {
            const unitId = item[CONFIG.vendasInadimplentes.UNIDADE_PRINCIPAL];
            if (!acc[unitId]) {
                acc[unitId] = { unitId, cliente: item[CONFIG.vendasInadimplentes.CLIENTE], totalAtrasado: 0, parcelas: [] };
            }
            acc[unitId].parcelas.push(item);
            acc[unitId].totalAtrasado += parseCurrency(item[CONFIG.vendasInadimplentes.VALOR_TOTAL]);
            return acc;
        }, {});
        return Object.values(grouped);
    }, [vendasData.inadimplentes]);
    const colorMap = { 'VENDIDO': 'bg-green-500', 'DISPONÍVEL': 'bg-gray-400', 'PERMUTA': 'bg-sky-500', 'RESERVADO': 'bg-amber-500', 'INADIMPLENTE': 'bg-red-600' };
    const legendItems = [{ status: 'Vendido', color: 'bg-green-500' }, { status: 'Disponível', color: 'bg-gray-400' }, { status: 'Permuta', color: 'bg-sky-500' }, { status: 'Reservado', color: 'bg-amber-500' }, { status: 'Inadimplente', color: 'bg-red-600', icon: <AlertCircle size={12} className="inline-block mr-1 text-red-600" /> }];
    const getArea = (unitId) => {
        const lastTwo = unitId % 100;
        if ([1, 2, 7, 8].includes(lastTwo)) return 52.2;
        if (lastTwo === 3) return 51.84;
        if ([4, 6].includes(lastTwo)) return 50.85;
        if (lastTwo === 5) return 51.48;
        return 0;
    };
    const andares = React.useMemo(() => {
        if (!vendasData.unidades) return {};
        return vendasData.unidades.reduce((acc, apt) => {
            const floor = Math.floor(apt[CONFIG.vendasEspelho.UNIDADE_ID] / 100);
            if (!acc[floor]) acc[floor] = [];
            const area = getArea(apt[CONFIG.vendasEspelho.UNIDADE_ID]);
            const pricePerM2 = apt.Total && area ? apt.Total / area : null;
            acc[floor].push({ ...apt, pricePerM2 });
            return acc;
        }, {});
    }, [vendasData.unidades]);
    const allPrices = React.useMemo(() => {
        const prices = [];
        Object.values(andares).forEach(floorApts => {
            floorApts.forEach(apt => {
                if (apt.pricePerM2 && apt.Posicao && apt.Posicao.toUpperCase() === 'VENDIDO') {
                    prices.push(apt.pricePerM2);
                }
            });
        });
        return prices.sort((a, b) => a - b);
    }, [andares]);
    const numPrices = allPrices.length;
    const topThreshold = numPrices > 0 ? allPrices[Math.floor(numPrices * 0.85)] : Infinity;
    const bottomThreshold = numPrices > 0 ? allPrices[Math.floor(numPrices * 0.15)] : -Infinity;
    const { avgPricePerM2Sold, avgPricePerM2ToSell, adjustedVgv } = React.useMemo(() => {
        let sumTotalSold = 0;
        let sumAreaSold = 0;
        let sumTotalPermuta = 0;
        let sumAreaPermuta = 0;
        let totalArea = 0;
        vendasData.unidades.forEach(apt => {
            const area = getArea(apt[CONFIG.vendasEspelho.UNIDADE_ID]);
            totalArea += area;
            const posicao = apt.Posicao && apt.Posicao.toUpperCase();
            if (posicao === 'VENDIDO' && apt.Total) {
                sumTotalSold += apt.Total;
                sumAreaSold += area;
            } else if (posicao === 'PERMUTA' && apt.Total) {
                sumTotalPermuta += apt.Total;
                sumAreaPermuta += area;
            }
        });
        const avgPricePerM2Sold = sumAreaSold > 0 ? sumTotalSold / sumAreaSold : 0;
        const adjustedVgv = vendasData.vgvTotal - sumTotalPermuta;
        const remainingVGV = adjustedVgv - sumTotalSold;
        const remainingArea = totalArea - sumAreaSold - sumAreaPermuta;
        const avgPricePerM2ToSell = remainingArea > 0 ? remainingVGV / remainingArea : 0;
        return { avgPricePerM2Sold, avgPricePerM2ToSell, adjustedVgv };
    }, [vendasData.unidades, vendasData.vgvTotal]);
    const { variacaoEstoqueUnidades, variacaoEstoqueValor, variacaoEstoquePercent, precoMedioVendaMes, variacaoInadimplenciaValor, variacaoInadimplenciaPercent } = vendasData;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <Card title="Unidades Vendidas (Mês)" value={vendasData.unidadesVendidas} icon={<CheckCircle className="text-green-500" />} smallText={`${vendasData.unidadesPermuta} em permuta`} />
                <Card title="Unidades em Estoque" value={vendasData.unidadesEstoque} icon={<Home className="text-gray-500" />} />
                <Card title="Valor de Estoque" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(vendasData.valorEstoque)}`} icon={<DollarSign className="text-gray-500" />} />
                <Card title="Receita de Vendas (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(vendasData.receitas.recebido)}`} icon={<DollarSign className="text-blue-500" />} />
                <Card title="A Receber (Inadimp. Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(vendasData.receitas.aReceber)}`} icon={<DollarSign className="text-amber-500" />} />
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Comparativo com Mês Anterior</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <Card title="Variação Estoque (Unid.)" value={variacaoEstoqueUnidades} icon={<Home className="text-gray-500" />} color={variacaoEstoqueUnidades >= 0 ? 'text-red-500' : 'text-green-500'} size="sm" />
                    <Card title="Variação Estoque (Valor)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(variacaoEstoqueValor)}`} icon={<ArrowDownUp className="text-gray-500" />} color={variacaoEstoqueValor >= 0 ? 'text-red-500' : 'text-green-500'} smallText={`${variacaoEstoquePercent.toFixed(2)} %`} size="sm" />
                    <Card title="Variação Inadimplência" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(variacaoInadimplenciaValor)}`} icon={<AlertCircle className="text-amber-500" />} color={variacaoInadimplenciaValor >= 0 ? 'text-red-500' : 'text-green-500'} smallText={`${variacaoInadimplenciaPercent.toFixed(2)} %`} size="sm" />
                    <Card title="Preço Médio de Venda (Mês)" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(precoMedioVendaMes)}`} icon={<DollarSign className="text-blue-500" />} size="sm" />
                    <Card title="VGV do Empreendimento" value={<div className="space-y-1 text-sm"><div>VGV Total: R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(vendasData.vgvTotal)}</div><div>VGV sem permutas: R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(adjustedVgv)}</div></div>} icon={<LandPlot className="text-indigo-500" />} />
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Preços Médios por m²</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Preço Médio Vendido" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(avgPricePerM2Sold)}/m²`} icon={<DollarSign className="text-green-500" />} />
                    <Card title="Preço Médio a Vender" value={`R$ ${new Intl.NumberFormat('pt-BR', formatOptions).format(avgPricePerM2ToSell)}/m²`} icon={<DollarSign className="text-blue-500" />} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Espelho de Vendas (Mês de Referência)</h3>
                <div className="space-y-2">
                    {Object.keys(andares).sort((a, b) => b - a).map(andar => (
                        <div key={andar} className="grid grid-cols-10 gap-2 items-center">
                            <div className="col-span-1 text-center font-bold text-gray-600">{andar}º Andar</div>
                            <div className="col-span-9 grid grid-cols-8 gap-2">
                                {andares[andar].sort((a, b) => a[CONFIG.vendasEspelho.UNIDADE_ID] - b[CONFIG.vendasEspelho.UNIDADE_ID]).map(apt => {
                                    const statusKey = (apt.Posicao || '').trim().toUpperCase();
                                    const statusColor = apt.isInadimplente ? colorMap['INADIMPLENTE'] : colorMap[statusKey] || 'bg-gray-800';
                                    const textColor = apt.isInadimplente || ['VENDIDO', 'PERMUTA', 'RESERVADO'].includes(statusKey) ? 'text-white' : 'text-black';
                                    const area = getArea(apt[CONFIG.vendasEspelho.UNIDADE_ID]);
                                    const precoM2 = apt.pricePerM2 ? new Intl.NumberFormat('pt-BR', formatOptions).format(apt.pricePerM2) : null;
                                    let priceClass = '';
                                    if (apt.pricePerM2 && statusKey === 'VENDIDO') {
                                        if (apt.pricePerM2 >= topThreshold) {
                                            priceClass = 'border-4 border-purple-700';
                                        } else if (apt.pricePerM2 <= bottomThreshold) {
                                            priceClass = 'border-4 border-black';
                                        }
                                    }
                                    return (
                                        <div key={apt[CONFIG.vendasEspelho.UNIDADE_ID]} className={`p-1 rounded text-center text-xs font-bold ${statusColor} ${priceClass} ${textColor}`}>
                                            <div>{apt[CONFIG.vendasEspelho.UNIDADE_ID]}</div>
                                            <div className="text-[9px]">{area} m²</div>
                                            {statusKey === 'VENDIDO' && precoM2 && <div className="text-[9px]">R$ {precoM2}/m²</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-6">
                    {legendItems.map(item => (
                        <div key={item.status} className="flex items-center text-sm text-gray-700">
                            <span className={`w-4 h-4 rounded-full mr-2 ${item.color}`}></span>
                            {item.icon}<span>{item.status}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-gray-700 mb-4">Inadimplentes (Mês de Referência)</h3>
                <div className="overflow-x-auto h-[60vh] print:h-auto print:overflow-visible">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 w-12"></th>
                                <th className="px-4 py-2">Unidade</th>
                                <th className="px-4 py-2">Cliente</th>
                                <th className="px-4 py-2 text-right">Valor Total Atrasado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inadimplentesAgrupados.map((group) => (
                                <React.Fragment key={group.unitId}>
                                    <tr className="border-b hover:bg-gray-100 cursor-pointer" onClick={() => toggleUnit(group.unitId)}>
                                        <td className="px-4 py-2 text-center">
                                            {expandedUnits[group.unitId] ? <MinusCircle size={16} className="text-red-500" /> : <PlusCircle size={16} className="text-green-500" />}
                                        </td>
                                        <td className="px-4 py-2 font-bold">{group.unitId}</td>
                                        <td className="px-4 py-2">{group.cliente}</td>
                                        <td className="px-4 py-2 text-right font-bold text-red-600">
                                            R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(group.totalAtrasado)}
                                        </td>
                                    </tr>
                                    {expandedUnits[group.unitId] && (
                                        <>
                                            <tr className="bg-gray-50">
                                                <td colSpan="2"></td>
                                                <td className="px-8 py-1 text-xs font-bold text-gray-500">Dias Atraso</td>
                                                <td className="px-4 py-1 text-xs font-bold text-gray-500 text-right">Valor da Parcela</td>
                                            </tr>
                                            {group.parcelas.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-200 bg-gray-50 hover:bg-gray-200">
                                                    <td colSpan="2"></td>
                                                    <td className="px-8 py-2 text-sm text-red-500 font-semibold">{item[CONFIG.vendasInadimplentes.DIAS_ATRASO]}</td>
                                                    <td className="px-4 py-2 text-sm text-right">
                                                        R$ {new Intl.NumberFormat('pt-BR', formatOptions).format(item[CONFIG.vendasInadimplentes.VALOR_TOTAL])}
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- FUNÇÕES DE PROCESSAMENTO DE DADOS (LÓGICA EXTRAÍDA) ---
const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const sValue = value.replace("R$", "").trim().replace(/\./g, "").replace(",", ".");
        const num = parseFloat(sValue);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

const parseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    let text = String(value).trim();
    text = text.replace(/%/g, '');
    text = text.replace(/R\$/g, '');
    const hasComma = text.indexOf(',') !== -1;
    const hasDot = text.indexOf('.') !== -1;
    if (hasComma && hasDot) {
        // assume dot thousand separator and comma decimal
        text = text.replace(/\./g, '').replace(/,/g, '.');
    } else if (hasComma) {
        text = text.replace(/,/g, '.');
    }
    const num = parseFloat(text);
    return isNaN(num) ? 0 : num;
};

const normalizeKey = (key) => {
    return String(key || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
};

const getRowValue = (row, key) => {
    const target = normalizeKey(key);
    const normalized = Object.keys(row).reduce((acc, rowKey) => {
        acc[normalizeKey(rowKey)] = row[rowKey];
        return acc;
    }, {});
    return normalized[target] !== undefined ? normalized[target] : row[key];
};

const sortByCode = (a, b) => {
    const partsA = String(a.cod || '').split('.').map(Number);
    const partsB = String(b.cod || '').split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i += 1) {
        const av = partsA[i] || 0;
        const bv = partsB[i] || 0;
        if (av !== bv) return av - bv;
    }
    return 0;
};

const parsePercent = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return 0;
    const sValue = String(value).replace(/%/g, "").trim().replace(",", ".");
    const num = parseFloat(sValue);
    return isNaN(num) ? 0 : num;
};

// ** FUNÇÃO CORRIGIDA **
const processInadimplentesPorMes = (data, dateStr, inadimplentesConfig) => {
    if (!data || !dateStr) return [];
    const [targetYear, targetMonth] = dateStr.split('-').map(Number);
    return data.filter(row => {
        // CORREÇÃO APLICADA AQUI:
        const rowDate = getUTCDate(row[inadimplentesConfig.MES_REFERENCIA]);
        return rowDate && rowDate.getUTCFullYear() === targetYear && rowDate.getUTCMonth() + 1 === targetMonth;
    }).map(row => ({
        ...row,
        // CORREÇÃO APLICADA AQUI:
        [inadimplentesConfig.VALOR_TOTAL]: parseCurrency(row[inadimplentesConfig.VALOR_TOTAL])
    }));
};

const processFinanceiroData = (data, referenceDate, config) => {
    if (!data || !referenceDate) return { financeiroData: initialData.financeiroData, custoAplicadoData: initialData.custoAplicadoData, summaryData: {} };
    const refDate = getUTCDate(`${referenceDate}-01`);
    const [refYear, refMonthOneBased] = referenceDate.split('-').map(Number);
    let custoObra = 0, custoAdmin = 0, custoIncorporacao = 0, materiaisEstoque = 0, totalLiberadoCaixa = 0, valorMensalCaixa = 0, gastoMes = 0, custoDiretoAplicado = 0, custoIndiretoAplicado = 0, custoIncorporacaoAplicado = 0;
    data.forEach(row => {
        const id = String(row[config.ID] || '').trim();
        if (id) {
            const custoFinal = parseCurrency(row[config.CUSTO_AO_TERMINO]);
            if (id.startsWith('1')) custoObra += custoFinal;
            else if (id.startsWith('2')) custoAdmin += custoFinal;
            else if (id.startsWith('3')) custoIncorporacao += custoFinal;
        }
    });
    const estoqueDoMesRow = data.find(row => {
        const rowDate = getUTCDate(row[config.ESTOQUE_DATA]);
        return rowDate && rowDate.getUTCFullYear() === refYear && (rowDate.getUTCMonth() + 1) === refMonthOneBased;
    });
    if (estoqueDoMesRow) materiaisEstoque = parseCurrency(estoqueDoMesRow[config.ESTOQUE_VALOR] || 0);
    const gastoMesRows = data.filter(r => {
        const rowDate = getUTCDate(r[config.GASTO_MES_DATA]);
        return rowDate && rowDate.getUTCFullYear() === refYear && (rowDate.getUTCMonth() + 1) === refMonthOneBased;
    });
    gastoMes = gastoMesRows.reduce((sum, r) => sum + parseCurrency(r[config.GASTO_MES_VALOR]), 0);
    const custoTotalHojeRows = data.filter(r => {
        const rowDate = getUTCDate(r[config.GASTO_MES_DATA]);
        if (!rowDate) return false;
        const lastDayRef = new Date(Date.UTC(refDate.getUTCFullYear(), refDate.getUTCMonth() + 1, 0));
        return rowDate <= lastDayRef;
    });
    const custoTotalHoje = custoTotalHojeRows.reduce((sum, r) => sum + parseCurrency(r[config.GASTO_MES_VALOR]), 0);
    const liberacoesCaixa = data.filter(row => getUTCDate(row[config.FINANCIAMENTO_DATA]));
    const liberacoesPassadas = liberacoesCaixa
        .filter(row => getUTCDate(row[config.FINANCIAMENTO_DATA]) <= refDate)
        .sort((a, b) => getUTCDate(b[config.FINANCIAMENTO_DATA]) - getUTCDate(a[config.FINANCIAMENTO_DATA]));
    if (liberacoesPassadas.length > 0) totalLiberadoCaixa = parseCurrency(liberacoesPassadas[0][config.FINANCIAMENTO_VALOR_ACUMULADO] || 0);
    const liberacaoDoMes = liberacoesCaixa.find(row => {
        const rowDate = getUTCDate(row[config.FINANCIAMENTO_DATA]);
        return rowDate && rowDate.getUTCFullYear() === refYear && (rowDate.getUTCMonth() + 1) === refMonthOneBased;
    });
    if (liberacaoDoMes) valorMensalCaixa = parseCurrency(liberacaoDoMes[config.FINANCIAMENTO_VALOR_MENSAL] || 0);
    const custoAplicadoDoMesRow = data.find(row => {
        const rowDate = getUTCDate(row[config.CUSTO_APLICADO_DATA]);
        return rowDate && rowDate.getUTCFullYear() === refYear && (rowDate.getUTCMonth() + 1) === refMonthOneBased && row[config.CUSTO_APLICADO_DIRETO];
    });
    if (custoAplicadoDoMesRow) {
        custoDiretoAplicado = parseCurrency(custoAplicadoDoMesRow[config.CUSTO_APLICADO_DIRETO]);
        custoIndiretoAplicado = parseCurrency(custoAplicadoDoMesRow[config.CUSTO_APLICADO_INDIRETO]);
        custoIncorporacaoAplicado = parseCurrency(custoAplicadoDoMesRow[config.CUSTO_APLICADO_INCORPORACAO]);
    }
    let faturamentoDiretoMes = 0, faturamentoDiretoAcumulado = 0;
    data.filter(r => r[config.FATURAMENTO_DIRETO_DATA] && r[config.FATURAMENTO_DIRETO_VALOR]).forEach(r => {
        const recebimentoDate = getUTCDate(r[config.FATURAMENTO_DIRETO_DATA]);
        if (recebimentoDate) {
            if (recebimentoDate.getUTCFullYear() === refYear && (recebimentoDate.getUTCMonth() + 1) === refMonthOneBased) {
                faturamentoDiretoMes += parseCurrency(r[config.FATURAMENTO_DIRETO_VALOR]);
            }
            if (recebimentoDate <= refDate) {
                faturamentoDiretoAcumulado += parseCurrency(r[config.FATURAMENTO_DIRETO_VALOR]);
            }
        }
    });
    const itensDeCusto = data.filter(r => r[config.ID]);
    const pagoObra = itensDeCusto
    .filter(row => String(row[config.ID] || '').trim().startsWith('1'))
    .reduce((sum, row) => sum + parseCurrency(row[config.PAGO]), 0);
    const orcamento = itensDeCusto.reduce((sum, row) => sum + parseCurrency(row[config.ORCADO]), 0);
    const comprometido = itensDeCusto.reduce((sum, row) => sum + parseCurrency(row[config.COMPROMETIDO]), 0);
    const economia = itensDeCusto.reduce((sum, row) => sum + parseCurrency(row[config.ESTOURO_ECONOMIA]), 0);
    const aPagar = itensDeCusto.reduce((sum, row) => sum + parseCurrency(row[config.A_PAGAR]), 0);
    const comprometidoObra = itensDeCusto
        .filter(row => String(row[config.ID]).startsWith('1'))
        .reduce((sum, row) => sum + parseCurrency(row[config.COMPROMETIDO]), 0);
    const servicosDoMes = data
        .filter(row => {
            if (!row[config.SERVICO_EXEC_DATA] || !row[config.SERVICO_EXEC_NOME]) return false;
            const dataConvertida = getUTCDate(row[config.SERVICO_EXEC_DATA]);
            if (!dataConvertida) return false;
            const rowYear = dataConvertida.getUTCFullYear();
            const rowMonth = dataConvertida.getUTCMonth() + 1;
            return rowYear === refYear && rowMonth === refMonthOneBased;
        })
        .map(row => {
            const quantidade = parseFloat(String(row[config.SERVICO_EXEC_QTD] || '0').replace(',', '.')) || 0;
            const valorOrcado = parseCurrency(row[config.SERVICO_EXEC_ORCADO]);
            const valorGasto = parseCurrency(row[config.SERVICO_EXEC_GASTO]);
            return {
                servico: row[config.SERVICO_EXEC_NOME],
                quantidade,
                totalOrcado: valorOrcado,
                custoReal: valorGasto,
                resultado: valorOrcado - valorGasto
            };
        });
    return {
        summaryData: {
        custoObra,
        pagoObra,
        custoAdmin,
        custoIncorporacao,
        gastoMes,
        custoTotal: custoTotalHoje,
        viabilidade: orcamento,
        comprometidoGlobal: comprometido,     // ✅ novo
        comprometidoObra                      // ✅ novo
    },
        financeiroData: {
            cards: { orcamento, aPagar, comprometido, economia, custoTotalHoje, materiaisEstoque, totalLiberadoCaixa, valorMensalCaixa, faturamentoDiretoMes, faturamentoDiretoAcumulado, recebimentoTotalMes: valorMensalCaixa + faturamentoDiretoMes, recebimentoTotalAcumulado: totalLiberadoCaixa + faturamentoDiretoAcumulado },
            detalhesCustos: itensDeCusto
        },
        custoAplicadoData: {
            custoDireto: custoDiretoAplicado, custoIndireto: custoIndiretoAplicado, custoIncorporacao: custoIncorporacaoAplicado,
            custoExecucao: custoDiretoAplicado + custoIndiretoAplicado,
            custoTotalAplicado: custoDiretoAplicado + custoIndiretoAplicado + custoIncorporacaoAplicado,
            gastoMes, valorMensalCaixa, recebimentoTotalMes: valorMensalCaixa + faturamentoDiretoMes,
            servicosDoMes
        }
    };
}

const processEvolucaoData = (data, referenceDate, custoTotal, orcamento, config) => {
    if (!data || !referenceDate) return { evolucaoData: initialData.evolucaoData, summaryData: {} };

    const refDate = getUTCDate(`${referenceDate}-01`);
    const [refYear, refMonthOneBased] = referenceDate.split('-').map(Number);
    
    const curvaS = data.map(row => {
        const rowDate = getUTCDate(row[config.MES_REFERENCIA]);
        if (!rowDate) return null;
        const displayMonth = rowDate.toLocaleString('pt-BR', { timeZone: 'UTC', month: 'short', year: '2-digit' }).replace('.', '');
        return {
            month: displayMonth,
            realizado: parsePercent(row[config.EXECUTADO_MENSAL]),
            baseline: parsePercent(row[config.BASELINE_MENSAL]),
            projetado: parsePercent(row[config.PROJETADO_MENSAL]),
            realizadoAcc: parsePercent(row[config.EXECUTADO_ACUMULADO]),
            baselineAcc: parsePercent(row[config.BASELINE_ACUMULADO]),
            projetadoAcc: parsePercent(row[config.PROJETADO_ACUMULADO])
        };
    }).filter(Boolean);

    const refRow = data.find(row => {
        const rowDate = getUTCDate(row[config.MES_REFERENCIA]);
        return rowDate && rowDate.getUTCFullYear() === refYear && rowDate.getUTCMonth() === refMonthOneBased - 1;
    });

    let summaryData = {}, evolucaoData = { curvaS };

    if (refRow) {
        const realizadoMensal = parsePercent(refRow[config.EXECUTADO_MENSAL]);
        const baselineMensal = parsePercent(refRow[config.BASELINE_MENSAL]);
        const projetadoMensal = parsePercent(refRow[config.PROJETADO_MENSAL]);
        const realizadoAcumulado = parsePercent(refRow[config.EXECUTADO_ACUMULADO]);
        const baselineAcumulado = parsePercent(refRow[config.BASELINE_ACUMULADO]);
        const projetadoAcumulado = parsePercent(refRow[config.PROJETADO_ACUMULADO]);
        
        summaryData.evolucaoMensal = { 
            realizado: realizadoMensal, 
            baseline: baselineMensal,
            projetado: projetadoMensal 
        };
        
        summaryData.analiseEvolucao = { realizadoFisico: realizadoAcumulado, baselineFisico: baselineAcumulado, realizadoFinanceiro: (orcamento > 0 ? (custoTotal / orcamento) * 100 : 0) };
        
        evolucaoData.evolucaoMes = { previsto: baselineMensal, realizado: realizadoMensal };
        evolucaoData.deltaGlobal = realizadoAcumulado - baselineAcumulado;

        // ATUALIZADO: Calculando os novos deltas em relação ao projetado
        evolucaoData.deltaMensalProjetado = realizadoMensal - projetadoMensal;
        evolucaoData.deltaGlobalProjetado = realizadoAcumulado - projetadoAcumulado;
    }

    const executionData = data.map(r => ({ 
        date: getUTCDate(r[config.MES_REFERENCIA]), 
        monthlyReal: parsePercent(r[config.EXECUTADO_MENSAL]), 
        monthlyBaseline: parsePercent(r[config.BASELINE_MENSAL]),
        monthlyProjetado: parsePercent(r[config.PROJETADO_MENSAL])
    })).filter(r => r.date);

    if(executionData.length > 0) {
        evolucaoData.avgDeltaBaseline = executionData.reduce((sum, r) => sum + r.monthlyBaseline, 0) / executionData.length;
        const allActiveMonths = executionData.filter(r => r.monthlyReal > 0);
        evolucaoData.avgDeltaProjetado = allActiveMonths.length > 0 ? allActiveMonths.reduce((sum, r) => sum + r.monthlyReal, 0) / allActiveMonths.length : 0;
        const allProjectedMonths = executionData.filter(r => r.monthlyProjetado > 0);
        evolucaoData.avgDeltaPlanejado = allProjectedMonths.length > 0 ? allProjectedMonths.reduce((sum, r) => sum + r.monthlyProjetado, 0) / allProjectedMonths.length : 0;
        const pastExecution = executionData.filter(r => r.date <= refDate);
        evolucaoData.avgDeltaReal = pastExecution.length > 0 ? pastExecution.reduce((sum, r) => sum + r.monthlyReal, 0) / pastExecution.length : 0;
    }

    const formatAsMonthYear = (date) => date ? getUTCDate(date).toLocaleString('pt-BR', {timeZone: 'UTC', month: 'short', year: '2-digit'}).replace('.', '') : 'N/D';
    const baselineEndRow = data.find(r => parsePercent(r[config.BASELINE_ACUMULADO]) >= 100);
    summaryData.previsaoFimBaseline = formatAsMonthYear(baselineEndRow ? baselineEndRow[config.MES_REFERENCIA] : null);
    
    const projectedEndRow = data.find(r => parsePercent(r[config.PROJETADO_ACUMULADO]) >= 100);
    summaryData.previsaoFimReal = formatAsMonthYear(projectedEndRow ? projectedEndRow[config.MES_REFERENCIA] : null);

    return { evolucaoData, summaryData };
}

const processVendasData = (espelhoData, inadimplentesData, referenceDate, faturamentoDiretoMes, config) => {
    if (!espelhoData || !referenceDate) return { vendasData: initialData.vendasData, summaryData: {} };
    const [refYear, refMonthOneBased] = referenceDate.split('-').map(Number);
    const inadimplentesDoMes = processInadimplentesPorMes(inadimplentesData, referenceDate, config.vendasInadimplentes);
    const processVendasPorMes = (data, dateStr) => {
        if (!data || !dateStr) return { unidades: [], vendidas: 0, estoque: 0, valorEstoque: 0, receita: 0, permuta: 0, vgv: 0 };
        const [year, month] = dateStr.split('-');
        const suffix = `${String(month).padStart(2, '0')}/${year.substring(2)}`;
        const posCol = `${config.vendasEspelho.POSICAO_PREFIX} ${suffix}`;
        const valCol = `${config.vendasEspelho.VALOR_PREFIX} ${suffix}`;
        if (!data[0] || data[0][posCol] === undefined) return { unidades: [], vendidas: 0, estoque: 0, valorEstoque: 0, receita: 0, permuta: 0, vgv: 0 };
        const unidades = data.map(apt => ({ ...apt, Posicao: apt[posCol], Total: apt[valCol] })).filter(apt => apt[config.vendasEspelho.UNIDADE_ID]);
        const vendidas = unidades.filter(u => u.Posicao && u.Posicao.toUpperCase() !== 'DISPONÍVEL');
        const estoque = unidades.filter(u => u.Posicao && u.Posicao.toUpperCase() === 'DISPONÍVEL');
        const permuta = unidades.filter(u => u.Posicao && u.Posicao.toUpperCase() === 'PERMUTA').length;
        const valorEstoque = estoque.reduce((sum, apt) => sum + parseCurrency(apt.Total), 0);
        const receita = vendidas.reduce((sum, apt) => sum + parseCurrency(apt.Total), 0);
        const vgv = unidades.reduce((sum, apt) => sum + parseCurrency(apt.Total), 0);
        return { unidades, vendidas: vendidas.length, estoque: estoque.length, valorEstoque, receita, permuta, vgv };
    };
    const prevMonthDate = new Date(refYear, refMonthOneBased - 2, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const currentData = processVendasPorMes(espelhoData, referenceDate);
    const prevData = processVendasPorMes(espelhoData, prevMonthStr);
    const delinquentUnitsSet = new Set(inadimplentesDoMes.map(item => item[config.vendasInadimplentes.UNIDADE_PRINCIPAL]));
    currentData.unidades.forEach(unit => {
        if (delinquentUnitsSet.has(unit[config.vendasEspelho.UNIDADE_ID])) {
            unit.isInadimplente = true;
        }
    });
    const unidadesVendidasMes = prevData.estoque - currentData.estoque;
    const aReceberMes = inadimplentesDoMes.reduce((sum, r) => sum + r[config.vendasInadimplentes.VALOR_TOTAL], 0);
    const inadimplentesAnterior = processInadimplentesPorMes(inadimplentesData, prevMonthStr, config.vendasInadimplentes);
    const aReceberMesAnterior = inadimplentesAnterior.reduce((sum, r) => sum + r[config.vendasInadimplentes.VALOR_TOTAL], 0);
    const variacaoInadimplenciaValor = aReceberMes - aReceberMesAnterior;
    const variacaoInadimplenciaPercent = aReceberMesAnterior > 0 ? (variacaoInadimplenciaValor / aReceberMesAnterior) * 100 : (aReceberMes > 0 ? 100 : 0);
    const vendasData = {
        unidades: currentData.unidades,
        unidadesVendidas: unidadesVendidasMes > 0 ? unidadesVendidasMes : 0,
        unidadesEstoque: currentData.estoque,
        valorEstoque: currentData.valorEstoque,
        unidadesPermuta: currentData.permuta,
        receitas: {
            recebido: faturamentoDiretoMes,
            aReceber: aReceberMes
        },
        inadimplentes: inadimplentesDoMes,
        vgvTotal: currentData.vgv,
        variacaoEstoqueUnidades: currentData.estoque - prevData.estoque,
        variacaoEstoqueValor: currentData.valorEstoque - prevData.valorEstoque,
        variacaoEstoquePercent: prevData.valorEstoque > 0 ? ((currentData.valorEstoque - prevData.valorEstoque) / prevData.valorEstoque) * 100 : 0,
        precoMedioVendaMes: unidadesVendidasMes > 0 ? (currentData.receita - prevData.receita) / unidadesVendidasMes : 0,
        variacaoInadimplenciaValor,
        variacaoInadimplenciaPercent,
    };
    const summaryData = {
        vendas: {
            total: vendasData.unidades.length,
            vendidas: vendasData.unidades.filter(u => u.Posicao && u.Posicao.toUpperCase() !== 'DISPONÍVEL').length
        }
    };
    return { vendasData, summaryData };
}

const processPlsData = (data, config) => {
    if (!data) return { medCefPlsData: initialData.medCefPlsData };
    
    const services = data.map(row => ({
        cod: getRowValue(row, config.COD) || '',
        servico: getRowValue(row, config.SERVICO) || '',
        valoresTotais: parseNumber(getRowValue(row, config.VALORES_TOTAIS)),
        pesoOrcamento: parseNumber(getRowValue(row, config.PESO_ORCAMENTO)),
        quantidade: parseNumber(getRowValue(row, config.QUANTIDADE)),
        unidade: getRowValue(row, config.UNIDADE) || '',
        custoTotal: parseNumber(getRowValue(row, config.CUSTO_TOTAL)),
        periodoServico: parseNumber(getRowValue(row, config.PERIODO_SERVICO)),
        acumulado: parseNumber(getRowValue(row, config.ACUMULADO)),
        globalObra: parseNumber(getRowValue(row, config.GLOBAL_OBRA)),
        medicao: parseNumber(getRowValue(row, config.MEDICAO)),
    })).filter(s => s.cod || s.servico);
    
    // Get totals from last row
    let totalsData = {
        valoresTotais: 0,
        periodoServico: 0,
        acumulado: 0,
        globalObra: 0,
        medicao: 0
    };
    
    if (data.length > 0) {
        const lastRow = data[data.length - 1];
        totalsData = {
            valoresTotais: parseNumber(getRowValue(lastRow, config.VALORES_TOTAIS)),
            periodoServico: parseNumber(getRowValue(lastRow, config.PERIODO_SERVICO)),
            acumulado: parseNumber(getRowValue(lastRow, config.ACUMULADO)),
            globalObra: parseNumber(getRowValue(lastRow, config.GLOBAL_OBRA)),
            medicao: parseNumber(getRowValue(lastRow, config.MEDICAO))
        };
    }
    return { medCefPlsData: { services, totalsData } };
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
    const [activePage, setActivePage] = useState('Resumo');
    const [dashboardData, setDashboardData] = useState(initialData);
    const [rawFilesData, setRawFilesData] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Processando...');
    const [isPrintMode, setIsPrintMode] = useState(false);
    const [financeiroViewType, setFinanceiroViewType] = useState('global');
    const getInitialDate = () => {
        const today = new Date();
        const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const year = previousMonth.getFullYear();
        const month = (previousMonth.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    };
    const [referenceDate, setReferenceDate] = useState(getInitialDate());
    const handleGeneratePdf = () => {
        setIsPrintMode(true);
    };
    useEffect(() => {
        if (isPrintMode) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [isPrintMode]);
    useEffect(() => {
        const handleAfterPrint = () => setIsPrintMode(false);
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);
    const pages = {
        'Resumo': <ResumoPage data={dashboardData} />,
        'Financeiro': <FinanceiroPage data={dashboardData} viewType={financeiroViewType} setViewType={setFinanceiroViewType} />,
        'Evolução': <EvolucaoPage data={dashboardData} isPrintMode={isPrintMode} />,
        'Med CEF PLS': <MedCefPlsPage data={dashboardData} />,
        'Custo Aplicado': <CustoAplicadoPage data={dashboardData} />,
        'Vendas': <VendasPage data={dashboardData} />,
    };
    const handleFileSelect = useCallback(async (files) => {
        setIsLoading(true);
        setRawFilesData(null);
        const readFile = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    resolve(json);
                } catch (err) { reject(err); }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
        try {
            const parsedData = {};
            for (const file of files) {
                const data = await readFile(file);
                if (file.name.includes('financeiro')) parsedData.financeiro = data;
                else if (file.name.includes('evolucao')) parsedData.evolucao = data;
                else if (file.name.includes('vendas-espelho')) parsedData.vendasEspelho = data;
                else if (file.name.includes('vendas-inadimplentes')) parsedData.vendasInadimplentes = data;
                else if (file.name.includes('pls')) parsedData.pls = data;
            }
            setRawFilesData(parsedData);
        } catch (error) {
            console.error("Erro ao ler arquivos:", error);
            setModal({ isOpen: true, message: `Erro ao ler arquivo: ${error.message}.` });
        } finally {
            setIsLoading(false);
        }
    }, []);
    const onFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files && files.length > 0) handleFileSelect(files);
        event.target.value = null;
    };
    // Carrega arquivos automaticamente da pasta /data/
    useEffect(() => {
        const loadFilesAutomatically = async () => {
            try {
                setIsLoading(true);
                setLoadingMessage('Carregando arquivos Excel...');
                
                // Tenta carregar a configuração
                const configResponse = await fetch('/data/config.json');
                if (!configResponse.ok) {
                    console.log('Arquivo de configuração não encontrado. Buscando arquivos manualmente...');
                    // Se não houver config, tenta carregar os arquivos comuns
                    const fileNames = ['financeiro.xlsx', 'evolucao.xlsx', 'vendas-espelho.xlsx', 'vendas-inadimplentes.xlsx', 'pls.xlsx'];
                    const files = [];
                    
                    for (const fileName of fileNames) {
                        try {
                            const response = await fetch(`/data/${fileName}`);
                            if (response.ok) {
                                const blob = await response.blob();
                                const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                files.push(file);
                            }
                        } catch (err) {
                            console.log(`Arquivo ${fileName} não encontrado.`);
                        }
                    }
                    
                    if (files.length > 0) {
                        await handleFileSelect(files);
                    }
                } else {
                    const config = await configResponse.json();
                    const files = [];
                    
                    for (const fileName of config.files) {
                        try {
                            const response = await fetch(`/data/${fileName}`);
                            if (response.ok) {
                                const blob = await response.blob();
                                const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                files.push(file);
                            }
                        } catch (err) {
                            console.log(`Erro ao carregar ${fileName}:`, err);
                        }
                    }
                    
                    if (files.length > 0) {
                        await handleFileSelect(files);
                    }
                }
                setLoadingMessage('');
            } catch (error) {
                console.log('Nenhum arquivo encontrado para carregamento automático.');
            } finally {
                setIsLoading(false);
                setLoadingMessage('');
            }
        };
        
        // Carrega os arquivos quando a página abre
        loadFilesAutomatically();
    }, [handleFileSelect]);
    const navItems = [
        { name: 'Resumo', icon: <Home size={18} /> },
        { name: 'Financeiro', icon: <DollarSign size={18} /> },
        { name: 'Evolução', icon: <TrendingUp size={18} /> },
        { name: 'Med CEF PLS', icon: <Ruler size={18} /> },
        { name: 'Custo Aplicado', icon: <ListChecks size={18} /> },
        { name: 'Vendas', icon: <Percent size={18} /> },
    ];
    const processedFinanceiro = useMemo(() => {
        if (!rawFilesData?.financeiro) return null;
        return processFinanceiroData(rawFilesData.financeiro, referenceDate, CONFIG.financeiro);
    }, [rawFilesData?.financeiro, referenceDate]);
    const processedEvolucao = useMemo(() => {
        if (!rawFilesData?.evolucao || !processedFinanceiro) return null;
        return processEvolucaoData(
            rawFilesData.evolucao,
            referenceDate,
            processedFinanceiro.summaryData.custoTotal,
            processedFinanceiro.summaryData.viabilidade,
            CONFIG.evolucao
        );
    }, [rawFilesData?.evolucao, referenceDate, processedFinanceiro]);
    const processedVendas = useMemo(() => {
        if (!rawFilesData?.vendasEspelho || !processedFinanceiro) return null;
        return processVendasData(
            rawFilesData.vendasEspelho,
            rawFilesData.vendasInadimplentes,
            referenceDate,
            processedFinanceiro.financeiroData.cards.faturamentoDiretoMes,
            CONFIG
        );
    }, [rawFilesData?.vendasEspelho, rawFilesData?.vendasInadimplentes, referenceDate, processedFinanceiro]);
    const processedPls = useMemo(() => {
        if (!rawFilesData?.pls) return null;
        return processPlsData(rawFilesData.pls, CONFIG.pls);
    }, [rawFilesData?.pls]);
    useEffect(() => {
        if (!processedFinanceiro && !processedEvolucao && !processedVendas && !processedPls) {
            setDashboardData(initialData);
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Montando Relatório...');
        try {
            const finalData = JSON.parse(JSON.stringify(initialData));
            if (processedFinanceiro) {
                finalData.financeiroData = processedFinanceiro.financeiroData;
                finalData.custoAplicadoData = processedFinanceiro.custoAplicadoData;
                Object.assign(finalData.summaryData, processedFinanceiro.summaryData);
            }
            if (processedEvolucao) {
                finalData.evolucaoData = processedEvolucao.evolucaoData;
                Object.assign(finalData.summaryData, processedEvolucao.summaryData);
            }
            if (processedVendas) {
                finalData.vendasData = processedVendas.vendasData;
                Object.assign(finalData.summaryData, processedVendas.summaryData);
            }
            if (processedPls) {
                finalData.medCefPlsData = processedPls.medCefPlsData;
            }
            setDashboardData(finalData);
        } catch (error) {
            console.error("Erro ao montar relatório final:", error);
            setModal({ isOpen: true, message: `Erro ao consolidar dados: ${error.message}.` });
        } finally {
            setIsLoading(false);
            setLoadingMessage('Processando...');
        }
    }, [processedFinanceiro, processedEvolucao, processedVendas, processedPls]);
    return (
        <>
            <style>{`
                .page-break { page-break-after: always; }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-hidden { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                    @page {
                        size: A4 landscape; margin: 1cm;
                        @bottom-left { content: "Gerado por: Ramon Soares"; font-size: 9px; color: #666; padding-left: 1cm; }
                        @bottom-right { content: "Página " counter(page) " de " counter(pages); font-size: 9px; color: #666; padding-right: 1cm; }
                    }
                }
            `}</style>
            <div className={isPrintMode ? 'print-mode' : ''}>
                <div id="print-area" className={!isPrintMode ? 'hidden' : 'block'}>
                    <div className="p-4">
                        <h1 className="text-3xl font-bold text-center mb-2">Relatório de Acompanhamento de Obra</h1>
                        <h2 className="text-xl text-center mb-8">
                            Mês de Referência: {new Date(referenceDate + '-02').toLocaleString('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' })}
                        </h2>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-2 mb-6">Resumo</h2>
                            <ResumoPage data={dashboardData} />
                        </section>
                        <div className="page-break"></div>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-2 mb-6">Financeiro</h2>
                            <FinanceiroPage data={dashboardData} setViewType={setFinanceiroViewType} viewType={financeiroViewType} printMode={true} />
                        </section>
                        <div className="page-break"></div>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-2 mb-6">Evolução da Obra</h2>
                            <EvolucaoPage data={dashboardData} isPrintMode={true} />
                        </section>
                        <div className="page-break"></div>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-2 mb-6">Med CEF PLS</h2>
                            <MedCefPlsPage data={dashboardData} />
                        </section>
                        <div className="page-break"></div>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-2 mb-6">Custo Aplicado</h2>
                            <CustoAplicadoPage data={dashboardData} />
                        </section>
                        <div className="page-break"></div>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-2 mb-6">Vendas</h2>
                            <VendasPage data={dashboardData} />
                        </section>
                    </div>
                </div>
                {!isPrintMode && (
                    <div className="flex w-full">
                        <aside className="w-56 bg-white shadow-lg p-4 flex-col hidden lg:flex print-hidden">
                            <div className="flex items-center space-x-3 mb-8"><div className="bg-blue-600 p-2 rounded-lg"><Home className="text-white" /></div><h1 className="text-xl font-bold text-gray-800">MR</h1></div>
                            <nav className="flex-1"><ul>{navItems.map(item => (<li key={item.name}><button onClick={() => setActivePage(item.name)} className={`w-full flex items-center space-x-3 p-3 my-1 rounded-lg text-sm font-medium ${activePage === item.name ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`} >{item.icon}<span>{item.name}</span></button></li>))}</ul></nav>
                            <div className="mt-auto text-center text-xs text-gray-400"><p>Dashboard de Obra v1.2</p></div>
                        </aside>
                        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
                            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <div><h2 className="text-2xl font-bold text-gray-800">Painel de Resumo - UP Buriti</h2></div>
                                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor="ref-date" className="text-sm font-medium text-gray-700">Mês/Ano de Referência:</label>
                                        <input type="month" id="ref-date" value={referenceDate} onChange={e => setReferenceDate(e.target.value)} className="bg-white border border-gray-300 rounded-md shadow-sm p-1.5 text-sm" />
                                    </div>
                                    <button onClick={handleGeneratePdf} disabled={!rawFilesData || isLoading} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 disabled:bg-blue-300 disabled:cursor-not-allowed">{isLoading ? <RefreshCw size={16} className="animate-spin" /> : <FileDown size={16} />}<span>{isLoading ? 'Aguarde...' : 'Gerar PDF'}</span></button>
                                    <div className="flex items-center space-x-2"><img src="https://placehold.co/40x40/E2E8F0/4A5568?text=RS" alt="Avatar do usuário" className="w-10 h-10 rounded-full" /><div><p className="font-semibold text-sm">Ramon Soares</p><p className="text-xs text-gray-500">Gerente de Projeto</p></div></div>
                                </div>
                            </header>
                            <div id="dashboard-content">
                                <input type="file" multiple accept=".xlsx, .xls" style={{ display: 'none' }} id="file-upload" onChange={onFileChange} />
                                {modal.isOpen && <Modal message={modal.message} onClose={() => setModal({ isOpen: false, message: '' })} />}
                                {Object.keys(pages).map(pageName => (<div key={pageName} className={activePage === pageName ? 'block' : 'hidden'}>{pages[pageName]}</div>))}
                            </div>
                        </main>
                    </div>
                )}
            </div>
        </>
    );
}