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
			{/* Filter toolbar */}
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

			{/* Project grid */}
			{filtered.length > 0 ? (
				<div className={styles.grid}>
					{filtered.map((project, i) => (
						<article
							key={project.title}
							className={`${styles.card} ${i === 0 ? styles.cardLarge : ''}`}
						>
							{/* Terminal-style window bar */}
							<div className={styles.cardBar}>
								<div className={styles.cardDots}>
									<span className={styles.dot} />
									<span className={styles.dot} />
									<span className={styles.dot} />
								</div>
								<span className={styles.cardFilename}>
									{project.title.toLowerCase().replace(/\s+/g, '-')}.md
								</span>
							</div>

							<div className={styles.cardBody}>
								<div className={styles.meta}>
									<span className={styles.statusBadge} data-status={project.status}>
										{project.status.replace('-', ' ')}
									</span>
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
										Read more →
									</a>
									{project.liveUrl && (
										<a className={styles.link} href={project.liveUrl} target="_blank" rel="noreferrer">
											Live ↗
										</a>
									)}
									{project.repoUrl && (
										<a className={styles.link} href={project.repoUrl} target="_blank" rel="noreferrer">
											Code ↗
										</a>
									)}
								</div>
							</div>
						</article>
					))}
				</div>
			) : (
				<div className={styles.empty}>
					<span className={styles.emptyPrompt}>$</span> No projects match this tag yet.
				</div>
			)}
		</div>
	);
}
