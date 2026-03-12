import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  useEffect(() => {
    buscarClientes();
  }, []);

  const buscarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });
      if (error) throw error;
      setClientes(data);
    } catch (error) {
      toast.error("Erro ao carregar a lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalNovo = () => {
    setClienteEditandoId(null);
    setNovoCliente({ nome: "", email: "", telefone: "" });
    setIsModalOpen(true);
  };

  const handleAbrirModalEditar = (cliente) => {
    setClienteEditandoId(cliente.id);
    setNovoCliente({
      nome: cliente.nome,
      email: cliente.email || "",
      telefone: cliente.telefone || "",
    });
    setIsModalOpen(true);
  };

  const handleSalvarCliente = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const dados = {
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
      };
      if (clienteEditandoId) {
        const { error } = await supabase
          .from("clientes")
          .update(dados)
          .eq("id", clienteEditandoId);
        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("clientes").insert([dados]);
        if (error) throw error;
        toast.success("Novo cliente cadastrado!");
      }
      setIsModalOpen(false);
      buscarClientes();
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o cliente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirCliente = async (id) => {
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
    if (!result.isConfirmed) return;
    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Cliente excluído com sucesso!");
      buscarClientes();
    } catch (error) {
      toast.error("Erro ao tentar excluir o cliente.");
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(termoBusca.toLowerCase()),
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">
              Gerenciar Clientes
            </h1>
            <p className="text-purple-400 text-sm mt-1">
              Cadastre, edite e remova clientes
            </p>
          </div>
          <button
            onClick={handleAbrirModalNovo}
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
            Novo Cliente
          </button>
        </div>

        <div className="mb-5">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Pesquisar cliente pelo nome..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-200 rounded-xl text-sm text-purple-900 placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
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

        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                {["Nome", "E-mail", "Telefone", "Ações"].map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider ${i === 3 ? "text-right" : "text-left"}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Carregando clientes...
                    </div>
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-purple-300 text-sm"
                  >
                    {termoBusca
                      ? "Nenhum cliente encontrado."
                      : "Nenhum cliente cadastrado no momento."}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-purple-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-900">
                      {cliente.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                      {cliente.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                      {cliente.telefone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAbrirModalEditar(cliente)}
                        className="text-violet-500 hover:text-violet-700 mr-4 font-semibold transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirCliente(cliente.id)}
                        className="text-rose-400 hover:text-rose-600 font-semibold transition"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-purple-950/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-purple-100">
            <div className="flex items-center justify-between p-6 border-b border-purple-100">
              <h2 className="text-xl font-bold text-purple-900">
                {clienteEditandoId ? "Editar Cliente" : "Cadastrar Cliente"}
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
            <form onSubmit={handleSalvarCliente} className="p-6 space-y-4">
              {[
                {
                  label: "Nome Completo",
                  key: "nome",
                  type: "text",
                  required: true,
                  placeholder: "",
                },
                {
                  label: "E-mail",
                  key: "email",
                  type: "email",
                  required: false,
                  placeholder: "",
                },
                {
                  label: "Telefone / WhatsApp",
                  key: "telefone",
                  type: "text",
                  required: false,
                  placeholder: "(00) 00000-0000",
                },
              ].map(({ label, key, type, required, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition"
                    value={novoCliente[key]}
                    onChange={(e) =>
                      setNovoCliente({ ...novoCliente, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
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
                  className="px-5 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold disabled:opacity-50 transition shadow-md shadow-violet-500/20"
                >
                  {salvando
                    ? "Salvando..."
                    : clienteEditandoId
                      ? "Atualizar Cliente"
                      : "Salvar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
