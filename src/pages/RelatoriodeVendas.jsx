import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import { Toaster, toast } from "react-hot-toast";

export default function Relatorios() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarRelatorioVendas();
  }, []);

  const buscarRelatorioVendas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendas")
        .select(`id, valor_total, created_at, clientes ( nome )`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setVendas(data);
    } catch (error) {
      toast.error("Erro ao carregar dados do relatório.");
    } finally {
      setLoading(false);
    }
  };

  const totalAcumulado = vendas.reduce(
    (acc, v) => acc + parseFloat(v.valor_total),
    0,
  );

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
        <div className="flex justify-between items-center mb-8 no-print">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Relatórios</h1>
            <p className="text-purple-400 text-sm mt-1">
              Histórico detalhado de vendas realizadas
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-violet-500/20 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimir Relatório
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                {["Data e Hora", "Cliente", "Valor da Venda"].map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider ${i === 2 ? "text-right" : "text-left"}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Carregando dados...
                    </div>
                  </td>
                </tr>
              ) : vendas.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-10 text-center text-purple-300 text-sm"
                  >
                    Nenhuma venda encontrada no período.
                  </td>
                </tr>
              ) : (
                vendas.map((venda) => (
                  <tr
                    key={venda.id}
                    className="hover:bg-purple-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                      {new Date(venda.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-900">
                      {venda.clientes?.nome || "Cliente não identificado"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-600">
                      {parseFloat(venda.valor_total).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        {!loading && vendas.length > 0 && (
          <div className="mt-5 flex justify-end">
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm px-6 py-4 text-right">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                Total acumulado
              </p>
              <p className="text-2xl font-black text-purple-900">
                {totalAcumulado.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        )}
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print, aside { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .bg-purple-50 { background: white !important; }
        }
      `,
        }}
      />
    </div>
  );
}
