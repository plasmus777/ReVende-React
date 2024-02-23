import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../contexts/AuthContext"
import logoRevende from "../../assets/logoRevende-cropped.svg"

function NavBar() {
  let navigate = useNavigate()

  const { usuario, handleLogout } = useContext(AuthContext)

  function logout() {
      handleLogout()
      alert('Usuário deslogado com sucesso.')
      navigate('/login')
  }

    return (
      <>
       <div className='w-full bg-[#308C50] text-white flex justify-center'>
            <div className="container flex justify-between text-lg">
              <div className='text-2xl font-bold uppercase shrink-0 border-2'>
                <img src={logoRevende} alt="ReVende" className="w-37 h-16"/>
              </div>
  
              <div className='flex gap-4 text-xl py-4'>
                <Link to='/home' className='hover:underline'>Início</Link>
                <Link to='/contact' className='hover:underline'>Contato</Link>
                <Link to='/about' className='hover:underline'>Sobre</Link>
                <Link to='/login' className='hover:underline'>Login</Link>
                <div className='hover:underline'>Produtos</div> 
                <div className='hover:underline'>Categorias</div>
                <div className='hover:underline'>Perfil</div>
                <Link to='' onClick={logout} className='hover:underline'>Sair</Link>
              </div>
            </div>
          </div>
      </>
    )
  }
  
  export default NavBar