import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function Vendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarDadosGerais();
  }, []);

  const buscarDadosGerais = async () => {
    try {
      const { data: dadosClientes, error: erroClientes } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });
      if (erroClientes) throw erroClientes;
      setClientes(dadosClientes);
      const { data: dadosProdutos, error: erroProdutos } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });
      if (erroProdutos) throw erroProdutos;
      setProdutos(dadosProdutos);
    } catch (error) {
      toast.error("Erro ao carregar clientes e produtos.");
    }
  };

  const handleAdicionarAoCarrinho = (e) => {
    e.preventDefault();
    if (!produtoSelecionado || quantidade <= 0) {
      toast.error("Selecione um produto e uma quantidade válida.");
      return;
    }
    const produtoInfo = produtos.find(
      (p) => p.id.toString() === produtoSelecionado,
    );
    if (!produtoInfo) return;
    const precoNumber = parseFloat(produtoInfo.preco);
    const qtdNumber = parseInt(quantidade);
    setCarrinho([
      ...carrinho,
      {
        produto_id: produtoInfo.id,
        nome: produtoInfo.nome,
        quantidade: qtdNumber,
        preco_unitario: precoNumber,
        subtotal: precoNumber * qtdNumber,
        idTemporario: Date.now(),
      },
    ]);
    setProdutoSelecionado("");
    setQuantidade(1);
  };

  const handleRemoverDoCarrinho = (idTemp) => {
    setCarrinho(carrinho.filter((item) => item.idTemporario !== idTemp));
  };

  const valorTotalVenda = carrinho.reduce(
    (total, item) => total + item.subtotal,
    0,
  );

  const handleFinalizarVenda = async () => {
    if (!clienteSelecionado) {
      toast.error("Por favor, selecione um cliente.");
      return;
    }
    if (carrinho.length === 0) {
      toast.error("Adicione pelo menos um produto ao carrinho.");
      return;
    }
    setSalvando(true);
    try {
      const { data: vendaCadastrada, error: erroVenda } = await supabase
        .from("vendas")
        .insert([
          { cliente_id: clienteSelecionado, valor_total: valorTotalVenda },
        ])
        .select()
        .single();
      if (erroVenda) throw erroVenda;

      const itensParaSalvar = carrinho.map((item) => ({
        venda_id: vendaCadastrada.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal,
      }));
      const { error: erroItens } = await supabase
        .from("itens_venda")
        .insert(itensParaSalvar);
      if (erroItens) throw erroItens;

      await Swal.fire({
        title: "Venda Finalizada!",
        text: `Venda de ${valorTotalVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} salva com sucesso.`,
        icon: "success",
        confirmButtonColor: "#7c3aed",
      });

      setClienteSelecionado("");
      setCarrinho([]);
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar a venda.");
    } finally {
      setSalvando(false);
    }
  };

  const selectClass =
    "w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition";
  const labelClass =
    "block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5";

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900">
            Frente de Caixa
          </h1>
          <p className="text-purple-400 text-sm mt-1">PDV — Ponto de Venda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Esquerdo */}
          <div className="lg:col-span-2 space-y-5">
            {/* Cliente */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-violet-100 text-violet-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  01
                </span>
                <h2 className="text-base font-bold text-purple-900">
                  Selecione o Cliente
                </h2>
              </div>
              <select
                className={selectClass}
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
              >
                <option value="">-- Escolha um cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Produto */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-violet-100 text-violet-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  02
                </span>
                <h2 className="text-base font-bold text-purple-900">
                  Adicionar Produtos
                </h2>
              </div>
              <form
                onSubmit={handleAdicionarAoCarrinho}
                className="flex items-end gap-4"
              >
                <div className="flex-1">
                  <label className={labelClass}>Produto</label>
                  <select
                    className={selectClass}
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                  >
                    <option value="">-- Escolha --</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} —{" "}
                        {parseFloat(p.preco).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className={labelClass}>Qtd.</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-violet-500/20 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Adicionar
                </button>
              </form>
            </div>
          </div>

          {/* Carrinho */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-purple-100 pb-3">
              <h2 className="text-base font-bold text-purple-900">Carrinho</h2>
              {carrinho.length > 0 && (
                <span className="bg-violet-100 text-violet-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {carrinho.length} {carrinho.length === 1 ? "item" : "itens"}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mb-4 min-h-[200px]">
              {carrinho.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-purple-300">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-sm">O carrinho está vazio.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {carrinho.map((item) => (
                    <li
                      key={item.idTemporario}
                      className="flex justify-between items-center bg-purple-50/50 border border-purple-100 p-3 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold text-purple-900 text-sm">
                          {item.nome}
                        </p>
                        <p className="text-xs text-purple-400">
                          {item.quantidade}x{" "}
                          {item.preco_unitario.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-800 text-sm">
                          {item.subtotal.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoverDoCarrinho(item.idTemporario)
                          }
                          className="text-rose-400 hover:text-rose-600 transition"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-purple-100 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-purple-400">
                  Total da Venda:
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {valorTotalVenda.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <button
                onClick={handleFinalizarVenda}
                disabled={salvando || carrinho.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-purple-200 disabled:text-purple-400 disabled:cursor-not-allowed
                  text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition duration-150 text-sm"
              >
                {salvando ? "Salvando Venda..." : "✓ Finalizar Venda"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
