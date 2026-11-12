export const profile = {
	name: 'Luke Enness',
	role: 'junior developer',
	tagline: 'Aspiring junior developer in Swansea, into software and machine learning.',
	location: 'Swansea, UK',
	email: 'luke@enness.dev',
	github: { label: 'github.com/L1UK3', href: 'https://github.com/L1UK3' },
	summary:
		'A passionate and energetic aspiring junior developer with a keen interest in software development and machine learning. Driven to use problem-solving skills to build high-quality solutions for complex technical challenges.',
};

export interface Project {
	title: string;
	blurb: string;
	href?: string;
	tags: string[];
	points: string[];
}

export const projects: Project[] = [
	{
		title: 'playsouthwales.uk',
		blurb: 'League scheduling web application',
		href: 'https://playsouthwales.uk/',
		tags: ['FastAPI', 'React 19', 'TypeScript', 'Supabase', 'Tailwind CSS'],
		points: [
			'Developed and launched a league scheduling web application for the South Wales competitive Pokémon community designed to solve player drop-off and scheduling clashes.',
			'Built a responsive frontend using React 19, TypeScript, TanStack Router, TanStack Query, Clerk Auth, and Tailwind CSS v4 backed by a FastAPI backend with a Supabase PostgreSQL database and Pydantic models.',
			'Wrote async background workers to automate the collection of relevant tournament data such as major events and release dates from community APIs and websites.',
			'Set up Docker Compose for local development and automated CI/CD pipelines for deployments to Vercel and Render.',
			'Built a companion Discord bot that automatically posts tournament pairings, schedules, and standings directly to local league servers.',
			'Scaled platform to 320 monthly active users and 1000+ page views, onboarding 16 tournament organisers across South Wales.',
		],
	},
	{
		title: 'Jeremy',
		blurb: 'Autonomous agent & simulation framework',
		tags: ['Python', 'PyTorch', 'Optuna', 'Pytest', 'NumPy'],
		points: [
			'Engineered an autonomous agent framework for the Kaggle Kaggriculture competition, tested with a 68-test Pytest suite.',
			'Implemented a spatial dispatcher that coordinates farm units across a grid by scoring chore priorities and Manhattan distances each turn.',
			'Designed a NumPy-based neural macro-policy for daily farm management tasks trained from supervised learning datasets generated from Parquet replay logging scripts.',
			'Ran parallel Optuna studies to tune multi-agent action priorities such as planting, watering, and harvesting.',
			'Automated bundling, verification, and performance benchmark scripts for submitting agents directly to Kaggle tournaments.',
		],
	},
	{
		title: 'Stunfisk',
		blurb: 'Reinforcement learning PTCG agent',
		tags: ['Python', 'PyTorch', 'MCTS', 'Reinforcement Learning'],
		points: [
			'Built an AlphaZero-style reinforcement learning agent for the Kaggle Pokémon Trading Card Game Battle Simulation competition.',
			'Combined neural network evaluation with Monte Carlo Tree Search (MCTS) to play competitive Pokémon TCG.',
			'Trained the neural network concurrently through self-play while optimizing PyTorch training loops to run efficiently on local hardware.',
		],
	},
	{
		title: 'Spectrophotometer',
		blurb: 'Laboratory data analysis tool',
		tags: ['TypeScript', 'Vite', 'Plotly'],
		points: [
			'Created a browser-based analysis tool in TypeScript and Vite, replacing legacy proprietary Windows XP software for university researchers.',
			'Created a client-side parser that takes raw .txt measurement files and plots absorbance of light curves using plotly.',
			'Currently used by Swansea University academic faculty and students to process data for dissertation research.',
		],
	},
	{
		title: 'CTHead Scan',
		blurb: 'Visual computing project',
		tags: ['JavaFX'],
		points: [
			'Engineered a desktop application to process and render 3D medical CT scan volumes.',
			'Developed the core rendering algorithms Maximum Intensity Projection (MIP) and 3D direct volume raycasting in JavaFX.',
			'Presented a live viva to university lecturers achieving 100% on the project.',
		],
	},
];
