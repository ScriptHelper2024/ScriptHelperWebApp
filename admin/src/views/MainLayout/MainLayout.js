import React from 'react'
import './MainLayout.scss'
import { Outlet, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faHome,
	faUser,
	faFileInvoiceDollar,
	faClapperboard,
	faBookOpen,
	faAddressBook,
	faPenFancy,
	faPepperHot,
	faWandMagicSparkles,
	faFlask,
	faWindowClose,
	faUsersGear,
	faGears,
} from '@fortawesome/free-solid-svg-icons'
import scriptHelperLogo from '../../assets/images/script-helper-logo.jpg'

const menuItems = [
	{
		title: 'Home',
		icon: faHome,
		url: '/',
	},
	{
		title: 'Users',
		icon: faUser,
		url: '/users',
	},
	{
		title: 'Author Styles',
		icon: faAddressBook,
		url: '/author-styles',
	},
	{
		title: 'Style Guidelines',
		icon: faPenFancy,
		url: '/style-guidelines',
	},
	{
		title: 'Script Dialog Flavors',
		icon: faPepperHot,
		url: '/script-dialog-flavors',
	},
	{
		title: 'Magic Notes',
		icon: faWandMagicSparkles,
		url: '/magic-notes',
	},
	{
		title: 'Prompt Templates',
		icon: faBookOpen,
		url: '/prompt-templates',
	},
	{
		title: 'Agent Tasks',
		icon: faUsersGear,
		url: '/agent-tasks',
	},
	{
		title: 'Platform Settings',
		icon: faGears,
		url: '/platform-settings',
	},
	{
		title: 'Query Browser',
		icon: faFlask,
		url: '/query-browser',
	},
]

const Layout = () => {
	const [menuOpen, setMenuOpen] = React.useState(false)

	const handleMenuToggle = () => {
		setMenuOpen(!menuOpen)
		return
	}

	return (
		<div className={`MainLayout ${menuOpen ? 'menu-open' : ''}`}>
			<div className="main-menu">
				<header>
					<button onClick={handleMenuToggle}>
						<img className="logo" src={scriptHelperLogo} />
						<h2 className="app-title">Script Helper</h2>
					</button>
				</header>
				<nav>
					<button onClick={handleMenuToggle}>
						<FontAwesomeIcon icon={faWindowClose} />
					</button>
					<ul>
						{menuItems.map((menuItem) => (
							<li key={menuItem.url}>
								<NavLink to={menuItem.url} onClick={() => setMenuOpen(false)}>
									<FontAwesomeIcon icon={menuItem.icon} />
									{menuItem.title}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
			</div>

			<main>
				<Outlet />
			</main>
		</div>
	)
}

export default Layout
