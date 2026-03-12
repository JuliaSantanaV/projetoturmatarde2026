import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  });

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });
      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error.message);
      setErro("Não foi possível carregar a lista de produtos.");
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalNovo = () => {
    setProdutoEditandoId(null);
    setNovoProduto({ nome: "", categoria: "", preco: "", estoque: "" });
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (produto) => {
    setProdutoEditandoId(produto.id);
    setNovoProduto({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      estoque: produto.estoque,
    });
    setIsModalOpen(true);
  };

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const dadosParaSalvar = {
        nome: novoProduto.nome,
        categoria: novoProduto.categoria,
        preco: parseFloat(novoProduto.preco),
        estoque: parseInt(novoProduto.estoque, 10),
      };

      if (produtoEditandoId) {
        const { error } = await supabase
          .from("produtos")
          .update(dadosParaSalvar)
          .eq("id", produtoEditandoId);
        if (error) throw error;
        toast.success("Produto atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("produtos")
          .insert([dadosParaSalvar]);
        if (error) throw error;
        toast.success("Novo produto cadastrado!");
      }

      setIsModalOpen(false);
      buscarProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error.message);
      toast.error("Ocorreu um erro ao salvar o produto.");
    } finally {
      setSalvando(false);
    }
  };

  // ✅ FIX: Usando async/await dentro do Swal corretamente
  // O .then() com async pode silenciar erros — agora está tratado com try/catch explícito
  const handleExcluirProduto = async (id) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não poderá ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    });

    // Só executa se o usuário confirmou
    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from("produtos").delete().eq("id", id);

      if (error) throw error;

      toast.success("Produto excluído com sucesso!");
      buscarProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error.message);
      toast.error("Erro ao tentar excluir o produto.");
    }
  };

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(termoBusca.toLowerCase()),
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">
              Gerenciar Produtos
            </h1>
            <p className="text-purple-400 text-sm mt-1">
              Cadastre, edite e remova produtos do estoque
            </p>
          </div>
          <button
            onClick={handleAbrirModalNovo}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-violet-500/20 transition duration-150"
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
            Novo Produto
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {erro}
          </div>
        )}

        {/* Barra de Pesquisa */}
        <div className="mb-5">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Pesquisar produto pelo nome..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm text-purple-900
                placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <svg
              className="w-4 h-4 text-purple-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                {["Nome", "Categoria", "Preço", "Estoque", "Ações"].map(
                  (col, i) => (
                    <th
                      key={col}
                      className={`px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-purple-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Carregando produtos...
                    </div>
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-purple-300 text-sm"
                  >
                    {termoBusca
                      ? "Nenhum produto encontrado com esse nome."
                      : "Nenhum produto cadastrado no momento."}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr
                    key={produto.id}
                    className="hover:bg-purple-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-900">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                      {produto.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-700">
                      {Number(produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          produto.estoque > 10
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {produto.estoque} un
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAbrirModalEditar(produto)}
                        className="text-violet-500 hover:text-violet-700 mr-4 transition font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirProduto(produto.id)}
                        className="text-rose-400 hover:text-rose-600 transition font-semibold"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-purple-950/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-purple-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-100">
              <h2 className="text-xl font-bold text-purple-900">
                {produtoEditandoId ? "Editar Produto" : "Cadastrar Produto"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-300 hover:text-purple-500 transition"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSalvarProduto} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-900
                    focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                  value={novoProduto.nome}
                  onChange={(e) =>
                    setNovoProduto({ ...novoProduto, nome: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-900
                    focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                  value={novoProduto.categoria}
                  onChange={(e) =>
                    setNovoProduto({
                      ...novoProduto,
                      categoria: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-900
                      focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                    value={novoProduto.preco}
                    onChange={(e) =>
                      setNovoProduto({ ...novoProduto, preco: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">
                    Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-900
                      focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                    value={novoProduto.estoque}
                    onChange={(e) =>
                      setNovoProduto({
                        ...novoProduto,
                        estoque: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-purple-50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm text-purple-500 bg-purple-50 hover:bg-purple-100 rounded-xl font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-500
                    rounded-xl font-semibold disabled:opacity-50 transition shadow-md shadow-violet-500/20"
                >
                  {salvando
                    ? "Salvando..."
                    : produtoEditandoId
                      ? "Atualizar Produto"
                      : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
