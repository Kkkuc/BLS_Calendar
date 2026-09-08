import React from 'react';
import type { Team } from '../../types';
import styles from './MatchList.module.css';

interface TeamHeaderProps {
    team: Team;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ team }) => {
    const defaultLogo = "/default-logo.png";
    const profileUrl = `https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=Profile&t_id=${team.id}`;
    const playersUrl = `https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamPlayers&t_id=${team.id}`;
    const scheduleUrl = `https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id=${team.id}`;

    return (
        <div className={styles.teamHeaderCard}>
            <img
                src={team.logoUrl || defaultLogo}
                alt={team.name}
                className={styles.teamLogoLarge}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultLogo;
                }}
            />

            <div className={styles.teamHeaderDetails}>
                <h2 className={styles.teamTitleLarge}>{team.name}</h2>

                <div className={styles.teamExternalLinks}>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={styles.leagueLink}>
                        📋 Profil
                    </a>
                    <a href={playersUrl} target="_blank" rel="noopener noreferrer" className={styles.leagueLink}>
                        👥 Zawodnicy
                    </a>
                    <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" className={styles.leagueLink}>
                        📅 Terminarz
                    </a>
                </div>
            </div>
        </div>
    );
};