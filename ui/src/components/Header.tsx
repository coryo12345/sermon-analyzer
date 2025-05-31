import { useLocation } from 'preact-iso';

export function Header() {
	const { url } = useLocation();

	return (
		<header className="bg-background-900 border-b border-surface-700">
			<nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<a 
						href="/" 
						className="text-primary-400 hover:text-primary-300 font-semibold text-lg transition-colors"
					>
						Home
					</a>
				</div>
			</nav>
		</header>
	);
}
