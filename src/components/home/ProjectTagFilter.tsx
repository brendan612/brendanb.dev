import { useMemo, useState } from 'react';
import styles from './ProjectTagFilter.module.css';

type Project = {
	title: string;
	summary: string;
	tags: string[];
	status: 'live' | 'in-progress' | 'archived';
	repoUrl?: string;
	liveUrl?: string;
	href: string;
};

type Props = {
	projects: Project[];
};

export default function ProjectTagFilter({ projects }: Props) {
	const [activeTag, setActiveTag] = useState<string>('All');
	const tags = useMemo(
		() => ['All', ...new Set(projects.flatMap((project) => project.tags))],
		[projects]
	);

	const filtered = useMemo(() => {
		if (activeTag === 'All') return projects;
		return projects.filter((project) => project.tags.includes(activeTag));
	}, [activeTag, projects]);

	return (
		<div>
			<div className={styles.toolbar} role="group" aria-label="Filter featured projects by tag">
				{tags.map((tag) => {
					const isActive = tag === activeTag;
					return (
						<button
							key={tag}
							type="button"
							className={`${styles.filterBtn} ${isActive ? styles.active : ''}`}
							onClick={() => setActiveTag(tag)}
							aria-pressed={isActive}
						>
							{tag}
						</button>
					);
				})}
			</div>

			{filtered.length > 0 ? (
				<div className={styles.grid}>
					{filtered.map((project) => (
						<article key={project.title} className={styles.card}>
							<div className={styles.meta}>
								<span className="chip">{project.tags[0] ?? 'Project'}</span>
								<span className={styles.status}>{project.status.replace('-', ' ')}</span>
							</div>
							<h3 className={styles.title}>{project.title}</h3>
							<p className={styles.summary}>{project.summary}</p>
							<div className={styles.tags}>
								{project.tags.map((tag) => (
									<span className={styles.tag} key={`${project.title}-${tag}`}>
										{tag}
									</span>
								))}
							</div>
							<div className={styles.linkRow}>
								<a className={styles.link} href={project.href}>
									Read more
								</a>
								{project.liveUrl && (
									<a className={styles.link} href={project.liveUrl} target="_blank" rel="noreferrer">
										Live
									</a>
								)}
								{project.repoUrl && (
									<a className={styles.link} href={project.repoUrl} target="_blank" rel="noreferrer">
										Code
									</a>
								)}
							</div>
						</article>
					))}
				</div>
			) : (
				<p className={styles.empty}>No projects match this tag yet.</p>
			)}
		</div>
	);
}
