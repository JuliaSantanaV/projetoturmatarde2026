import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Toaster, toast } from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    qtdVendas: 0,
    qtdClientes: 0,
    qtdProdutos: 0,
    valorEstoque: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosResumo();
  }, []);

  const carregarDadosResumo = async () => {
    try {
      setLoading(true);

      const { data: vendas, error: erroVendas } = await supabase
        .from("vendas")
        .select("valor_total");
      if (erroVendas) throw erroVendas;
      const totalFinanceiro = vendas.reduce(
        (acc, v) => acc + parseFloat(v.valor_total),
        0,
      );

      const { count: contagemClientes } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      const { data: produtos, error: erroProdutos } = await supabase
        .from("produtos")
        .select("preco, estoque");
      if (erroProdutos) throw erroProdutos;

      const totalEstoque = produtos.reduce(
        (acc, p) => acc + parseFloat(p.preco || 0) * (p.estoque || 0),
        0,
      );

      setResumo({
        totalVendas: totalFinanceiro,
        qtdVendas: vendas.length,
        qtdClientes: contagemClientes || 0,
        qtdProdutos: produtos.length,
        valorEstoque: totalEstoque,
      });
    } catch (error) {
      console.error("Erro ao carregar resumo:", error.message);
      toast.error("Erro ao atualizar indicadores.");
    } finally {
      setLoading(false);
    }
  };

  const cardBase =
    "bg-white rounded-2xl p-6 shadow-sm border-t border-r border-b border-purple-100 border-l-4";

  const secao1 = [
    {
      label: "Itens no Catálogo",
      valor: `${resumo.qtdProdutos} produtos`,
      cor: "border-l-violet-500",
      iconBg: "bg-violet-50",
      iconCor: "text-violet-400",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: "Valor Total em Estoque",
      valor: resumo.valorEstoque.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      cor: "border-l-purple-500",
      iconBg: "bg-purple-50",
      iconCor: "text-purple-400",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
    },
    {
      label: "Clientes Cadastrados",
      valor: `${resumo.qtdClientes} pessoas`,
      cor: "border-l-fuchsia-500",
      iconBg: "bg-fuchsia-50",
      iconCor: "text-fuchsia-400",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex bg-purple-50 min-h-screen w-full">
      <Sidebar />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e1b4b",
            color: "#e9d5ff",
            border: "1px solid #4c1d95",
          },
        }}
      />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900">
            Painel de Controle
          </h1>
          <p className="text-purple-400 text-sm mt-1">
            Bem-vindo(a) de volta,{" "}
            <span className="font-semibold text-violet-600">{user?.email}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-purple-400 text-sm">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Atualizando indicadores...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Inventário e Base */}
            <div>
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">
                Gestão de Inventário e Base
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {secao1.map((card) => (
                  <div key={card.label} className={`${cardBase} ${card.cor}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                        {card.label}
                      </p>
                      <span
                        className={`${card.iconBg} ${card.iconCor} p-1.5 rounded-lg`}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {card.valor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desempenho de Vendas */}
            <div>
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">
                Desempenho de Vendas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Faturamento */}
                <div className={`${cardBase} border-l-emerald-500`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                      Faturamento Total
                    </p>
                    <span className="bg-emerald-50 text-emerald-500 p-1.5 rounded-lg">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-black text-emerald-600">
                    {resumo.totalVendas.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>

                {/* Volume */}
                <div className={`${cardBase} border-l-violet-500`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                      Volume de Vendas
                    </p>
                    <span className="bg-violet-50 text-violet-400 p-1.5 rounded-lg">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-black text-purple-900">
                    {resumo.qtdVendas}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    transações registradas
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
