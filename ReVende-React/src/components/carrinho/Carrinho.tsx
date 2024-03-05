import { Fragment, useContext, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { CarrinhoContext } from '../../contexts/CarrinhoContext';
import Produto from '../../models/Produto';
import { AuthContext } from '../../contexts/AuthContext';
import { toastAlerta } from '../../util/toastAlerta';
import { Link, useNavigate } from 'react-router-dom';
import ProdutoCarrinho from '../../models/ProdutoCarrinho';
import CardCarrinho from './cardCarrinho/CardCarrinho';
import { buscar } from '../../services/Service';

function Carrinho() {
  let navigate = useNavigate();

  const [open, setOpen] = useState(true);

  const { usuario } = useContext(AuthContext);
  const token = usuario.token;

  const [produtoAtual, setProdutoAtual] = useState<Produto>({id:0, nome:'', foto:'', preco:0, descricao:'', quantidade:0, categoria:null, usuario:null});

  const [loadingProduto, setLoadingProduto] = useState(false);

  const ctx = useContext(CarrinhoContext);

  async function buscarProdutoPorId(id: number) {
    try {
      buscar(`/produtos/${id}`, setProdutoAtual);

    } catch (error:any){
      toastAlerta('Ocorreu um erro ao carregar o produto no carrinho.', 'erro');
    }
  }

  useEffect(() => {
    if (token === '') {
      toastAlerta('Você precisa estar logado', 'info');
      navigate('/login');
    }
  }, [token]);

  useEffect(() => {
    if (ctx.produtos.length > 0 && !loadingProduto) {
      setLoadingProduto(true);
  
      const promises = ctx.produtos.map((produto) =>
        buscarProdutoPorId(produto.id)
      );
  
      Promise.all(promises)
        .then(() => setLoadingProduto(false))
        .catch((error) => {
          toastAlerta('Ocorreu um erro ao carregar produtos no carrinho.', 'erro');
          console.log(error);
          setLoadingProduto(false);
        });
    }
  }, [ctx.produtos, loadingProduto]);

  function listaProduto(produto: ProdutoCarrinho) {
    if (!produtoAtual || !produtoAtual.usuario) {
      return null;
    }

    return (
      <CardCarrinho id={produto.id} nome={produtoAtual.nome} foto={produtoAtual.foto} preco={produtoAtual.preco} quantidade={produto.quantidade} vendedor={produtoAtual.usuario.nome} />
    );
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">Carrinho de compras</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Fechar painel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {ctx.produtos.map((produto) => listaProduto(produto))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>R$ {ctx.valorTotal}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Frete e taxas calculadas na compra.</p>
                      <div className="mt-6">
                        <Link to=''
                          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                          onClick={ctx.limparCarrinho}
                        >
                          Comprar
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <Link to='/produtos'
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={() => setOpen(false)}
                          >
                            Continue Comprando
                            <span aria-hidden="true"> &rarr;</span>
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Carrinho;