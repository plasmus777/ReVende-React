import { ReactNode, createContext, useContext, useState } from "react";
import { toastAlerta } from "../util/toastAlerta";
import ProdutoCarrinho from "../models/ProdutoCarrinho";
import { buscarAtravesId } from "../services/Service";
import { AuthContext } from "./AuthContext";

interface CarrinhoContextProps {
	produtos: ProdutoCarrinho[];
	valorTotal?: number | 0;
	adicionarProduto(id:number): void;
	removerProduto(id:number): void;
	limparCarrinho(): void;
	updateValorTotal(): void;
	carrinhoVazio(): boolean;
}

interface CarrinhoProviderProps {
	children: ReactNode;
}

export const CarrinhoContext = createContext({} as CarrinhoContextProps);

export function CarrinhoProvider({ children }: CarrinhoProviderProps) {

	const [precoAtual, setPrecoAtual] = useState<number>();

	const [produtos, setProdutos] = useState<ProdutoCarrinho[]>([]);
	const [valorTotal, setValorTotal] = useState<number>();

	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

	function adicionarProduto(id:number) {
		const lista_nova = [...produtos];

		const novoProduto = lista_nova.find((produto) => produto.id = id);

		if(!novoProduto){
			lista_nova.push({id:id, quantidade:1})
			toastAlerta('Um novo produto foi adicionado ao carrinho.', 'sucesso');
		} else {
			novoProduto.quantidade = novoProduto.quantidade + 1;
			toastAlerta('Um novo produto foi adicionado ao carrinho.', 'sucesso');
		}

		setProdutos(lista_nova);
		updateValorTotal();
	}

	function removerProduto(id:number){
		const lista_nova = [...produtos];

		const novoProduto = lista_nova.find((produto) => produto.id = id);

		if(novoProduto == null){
			toastAlerta('Ocorreu um erro ao processar o carrinho.', 'erro');
		} else {
			if(novoProduto && novoProduto.quantidade > 1){
				novoProduto.quantidade = novoProduto.quantidade - 1;
				setProdutos(lista_nova);
				updateValorTotal();
				toastAlerta('Um produto foi removido do carrinho.', 'sucesso');
			} else {
				const lista_filtrada = lista_nova.filter((produto) => produto.id != id);
				setProdutos(lista_filtrada);
				updateValorTotal();
				toastAlerta('Um produto foi removido do carrinho.', 'sucesso');
			}
		}
	}

	function limparCarrinho(){
		setProdutos([]);
		updateValorTotal();
		toastAlerta('O carrinho de produtos foi esvaziado.', 'sucesso');
	}

	async function updateValorTotal(){
		if(produtos != null){
			try {
				setPrecoAtual(0);

				if(valorTotal != null && precoAtual != null){
					produtos.forEach(
						(produto) => {
							buscarAtravesId(`/produtos/${produto.id}`, setPrecoAtual, {
								headers: {
									Authorization: token,
								},
							});
							setValorTotal(valorTotal + precoAtual*produto.quantidade);
						}
					);
				}
			} catch (error: any) {
				setValorTotal(0);
				if (error.toString().includes('403')) {
					toastAlerta('O token expirou, favor logar novamente', 'info');
					handleLogout();
				} else {
					toastAlerta('Ocorreu um erro ao obter o valor total do carrinho.', 'erro');
					console.log(error);
				}
			}
		} else{
			setValorTotal(0);
		}
	}
	
	function carrinhoVazio(){
		let vazio = true;

		if(produtos.length > 0 && produtos != null){
			produtos.forEach((produto) => {
				if(produto.quantidade > 0){
					vazio = false;
				}
			});
		}

		return vazio;
	}

	return (
		<CarrinhoContext.Provider value={{produtos, valorTotal, removerProduto, adicionarProduto, updateValorTotal, limparCarrinho, carrinhoVazio}}>
			{children}
		</CarrinhoContext.Provider>
	);
}
