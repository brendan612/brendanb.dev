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

const QUEST_LABEL: Record<Project['status'], string> = {
	live: 'quest complete',
	'in-progress': 'quest active',
	archived: 'quest retired',
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
			{/* Tag filter */}
			<div className={styles.toolbar} role="group" aria-label="Filter projects by tag">
				<span className={styles.toolbarLabel} aria-hidden="true">
					Filter:
				</span>
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

			{/* Quest cards */}
			{filtered.length > 0 ? (
				<div className={styles.grid}>
					{filtered.map((project, i) => {
						const isLarge = i === 0;
						return (
							<article
								key={project.title}
								className={`${styles.card} ${isLarge ? styles.cardLarge : ''}`}
							>
								{isLarge && (
									<span className={styles.featuredTab} aria-hidden="true">
										★ featured
									</span>
								)}

								<div className={styles.head}>
									<span className={styles.questType}>side quest</span>
									<span
										className={styles.statusBadge}
										data-status={project.status}
									>
										{QUEST_LABEL[project.status]}
									</span>
								</div>

								<h3 className={styles.title}>{project.title}</h3>
								<p className={styles.summary}>{project.summary}</p>

								<div className={styles.lootRow}>
									<span className={styles.lootLabel} aria-hidden="true">
										Built with
									</span>
									{project.tags.map((tag) => (
										<span className={styles.tag} key={`${project.title}-${tag}`}>
											{tag}
										</span>
									))}
								</div>

								<div className={styles.linkRow}>
									<a
										className={`${styles.link} ${styles.linkPrimary}`}
										href={project.href}
									>
										Open quest
									</a>
									{project.liveUrl && (
										<a
											className={styles.link}
											href={project.liveUrl}
											target="_blank"
											rel="noreferrer"
										>
											Play live
										</a>
									)}
									{project.repoUrl && (
										<a
											className={styles.link}
											href={project.repoUrl}
											target="_blank"
											rel="noreferrer"
										>
											Source
										</a>
									)}
								</div>
							</article>
						);
					})}
				</div>
			) : (
				<div className={styles.empty}>
					No quests tagged “{activeTag}” yet — pick another filter.
				</div>
			)}
		</div>
	);
}
