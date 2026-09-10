import styles from './ProjectGrid.module.css';

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
	email: string;
};

const STATUS_LABEL: Record<Project['status'], string> = {
	live: 'Live',
	'in-progress': 'In progress',
	archived: 'Archived',
};

export default function ProjectGrid({ projects, email }: Props) {
	return (
		<div className={styles.grid}>
			{projects.map((project) => {

				return (
					<article
						key={project.title}
						className={styles.card}
					>


						<div className={styles.head}>
							<span className={styles.questType}>{project.tags[0]}</span>
							<span
								className={styles.statusBadge}
								data-status={project.status}
							>
								{STATUS_LABEL[project.status]}
							</span>
						</div>

						<h3 className={styles.title}><a href={project.href}>{project.title}</a></h3>
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
								View project
							</a>
							{project.liveUrl && (
								<a
									className={styles.link}
									href={project.liveUrl}
									target="_blank"
									rel="noreferrer"
								>
									Visit site
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
            <aside className={styles.contact} aria-label="Contact">
                <p className={styles.questType}>Contact</p>
                <h3>Have a <span>project in mind?</span></h3>
                <p className={styles.summary}>Email me if you'd like to work together or ask about something I've built.</p>
                <a className="btn btn-primary" href={`mailto:${email}`}>Get in touch <span aria-hidden="true">&#8599;</span></a>
            </aside>
        </div>
    );
}
