import { useState, useEffect, useMemo } from 'react';
import type { Team } from '../../types'; // dostosuj ścieżkę do types
import { apiFetch } from '../../services/api.ts';
import { CompetitionBottomSheet, type CompetitionType } from './CompetitionBottomSheet';
import styles from './TeamSelection.module.css';

interface TeamSelectionProps {
    onSelectTeam: (team: Team) => void;
    selectedTeamId?: number | null;
}

export default function TeamSelection({ onSelectTeam, selectedTeamId }: TeamSelectionProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [competition, setCompetition] = useState<CompetitionType>('league1');
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const defaultLogo = "/default-logo.png";

    useEffect(() => {
        async function loadTeams() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await apiFetch('/api/teams');
                if (!response.ok) throw new Error(`Błąd serwera HTTP: ${response.status}`);

                const data: Team[] = await response.json();
                const cleanTeams = data.filter((team) => {
                    const invalidNames = ['najnowsze wiadomości', 'błąd', 'szanowni użytkownicy'];
                    return !invalidNames.some((invalid) => team.name.toLowerCase().includes(invalid));
                });

                setTeams(cleanTeams);

                if (selectedTeamId) {
                    const found = cleanTeams.find((t) => t.id === selectedTeamId);
                    if (found) setSelectedTeam(found);
                }
            } catch (err: any) {
                console.error("Błąd pobierania drużyn:", err);
                setError("Nie udało się pobrać listy drużyn z serwera.");
            } finally {
                setIsLoading(false);
            }
        }
        loadTeams();
    }, [selectedTeamId]);

    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            let matchesCompetition = false;
            switch (competition) {
                case 'league1': matchesCompetition = team.leagueNum === 1; break;
                case 'league2': matchesCompetition = team.leagueNum === 2; break;
                case 'cup': matchesCompetition = Boolean(team.isInCup); break;
                case 'cupElim': matchesCompetition = Boolean(team.isInCupElim); break;
                case 'superCup': matchesCompetition = Boolean(team.isInSuperCup); break;
            }
            const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
            return matchesCompetition && matchesSearch;
        });
    }, [teams, competition, searchQuery]);

    const getCompetitionName = (type: CompetitionType) => {
        switch (type) {
            case 'league1': return 'I Liga';
            case 'league2': return 'II Liga';
            case 'cup': return 'Puchar Ligi';
            case 'cupElim': return 'Puchar Ligi - Eliminacje';
            case 'superCup': return 'SuperPuchar';
        }
    };

    const getCompetitionEmoji = (type: CompetitionType) => {
        switch (type) {
            case 'league1': return '🥇';
            case 'league2': return '🥈';
            case 'cup': return '🏆';
            case 'cupElim': return '🎯';
            case 'superCup': return '⭐';
        }
    };

    if (isLoading) return <div className={`${styles.card} ${styles.loadingState}`}><p>Pobieranie aktywnych drużyn...</p></div>;
    if (error) return <div className={`${styles.card} ${styles.errorState}`}><p>{error}</p><button onClick={() => window.location.reload()}>Spróbuj ponownie</button></div>;

    return (
        <div className={styles.card}>
            <div className={styles.topBar}>
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    title={getCompetitionName(competition)}
                    className={styles.competitionBtn}
                >
                    <span style={{ fontSize: '16px' }}>{getCompetitionEmoji(competition)}</span>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>▼</span>
                </button>

                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Szukaj drużyny..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.teamList}>
                {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => {
                        const isSelected = selectedTeam?.id === team.id;
                        return (
                            <div
                                key={team.id}
                                className={`${styles.teamItem} ${isSelected ? styles.selected : ''}`}
                                onClick={() => setSelectedTeam(team)}
                            >
                                <div className={styles.teamInfo}>
                                    <img
                                        src={team.logoUrl || defaultLogo}
                                        alt={team.name}
                                        className={styles.teamLogo}
                                        onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; }}
                                    />
                                    <span className={styles.teamName}>{team.name}</span>
                                </div>
                                <div className={styles.teamComment}>Kliknij aby wybrać</div>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.emptyState}>Brak drużyn w tej kategorii dla podanej frazy.</div>
                )}
            </div>

            <div className={styles.actionFooter}>
                <button
                    type="button"
                    className={styles.submitBtn}
                    disabled={!selectedTeam}
                    onClick={() => selectedTeam && onSelectTeam(selectedTeam)}
                >
                    {selectedTeam ? `Pobierz mecze dla: ${selectedTeam.name}` : 'Wybierz drużynę'}
                </button>
            </div>

            <CompetitionBottomSheet
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                currentCompetition={competition}
                onSelect={(type) => {
                    setCompetition(type);
                    setSelectedTeam(null);
                    setIsMenuOpen(false);
                }}
                getCompetitionName={getCompetitionName}
                getCompetitionEmoji={getCompetitionEmoji}
            />
        </div>
    );
}