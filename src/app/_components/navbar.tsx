// components/Navbar.tsx
import { NavButtons } from './NavButtons'

const NavBar = () => {
  return (
    <nav className="mx-auto w-full shadow-md">
      <div className="container mx-auto px-2">
        <NavButtons />
      </div>
    </nav>
  )
}

export default NavBar
