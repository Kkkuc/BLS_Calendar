import React, { useEffect, useState } from 'react';
import type { MatchDto } from '../../types/match';
import type { Team } from '../../types';
import { apiFetch } from '../../services/api.ts';
import { TeamHeader } from './TeamHeader';
import { MatchColumn } from './MatchColumn';
import styles from './MatchList.module.css';

interface MatchListProps {
    team: Team | null;
    onBack?: () => void;
    onExportSelected?: (selectedMatches: MatchDto[]) => void;
}

export const MatchList: React.FC<MatchListProps> = ({ team, onBack, onExportSelected }) => {
    const [allMatches, setAllMatches] = useState<MatchDto[]>([]);
    const [selectedMatches, setSelectedMatches] = useState<MatchDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isUnplayedMatch = (m: MatchDto): boolean => {
        if ('isUnplayed' in m) return Boolean((m as any).isUnplayed);
        if ('IsUnplayed' in m) return Boolean((m as any).IsUnplayed);
        const hasNoScore = m.hostSetsResult === 0 && m.guestSetsResult === 0;
        const isFinishedStatus = m.status?.toLowerCase().includes('koniec') || m.status?.toLowerCase().includes('zakończony');
        return hasNoScore && !isFinishedStatus;
    };

    useEffect(() => {
        if (!team?.id) return;

        const fetchMatches = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiFetch(`/api/teams/${team.id}/matches`);
                if (!response.ok) throw new Error('Nie udało się pobrać terminarza meczów.');

                const data: MatchDto[] = await response.json();
                setAllMatches(data);
                setSelectedMatches(data.filter(isUnplayedMatch));
            } catch (err: any) {
                setError(err.message || 'Wystąpił błąd podczas ładowania meczów.');
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [team?.id]);

    const upcomingMatches = allMatches.filter(isUnplayedMatch);
    const playedMatches = allMatches.filter((m) => !isUnplayedMatch(m));

    const isMatchSelected = (match: MatchDto) => {
        return selectedMatches.some(
            (m) => m.round === match.round && m.host === match.host && m.guest === match.guest
        );
    };

    const toggleSelectMatch = (match: MatchDto) => {
        if (isMatchSelected(match)) {
            setSelectedMatches(selectedMatches.filter((m) => !(m.round === match.round && m.host === match.host && m.guest === match.guest)));
        } else {
            setSelectedMatches([...selectedMatches, match]);
        }
    };

    const toggleSelectAllUpcoming = () => {
        if (selectedMatches.length === upcomingMatches.length) {
            setSelectedMatches([]);
        } else {
            setSelectedMatches([...upcomingMatches]);
        }
    };

    const formatDate = (rawDate: string | Date | undefined) => {
        if (!rawDate) return 'Brak daty';
        return new Date(rawDate).toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!team) return <div className="card text-center">Wybierz drużynę.</div>;
    if (loading) return <div className="card loading-state"><p>Ładowanie terminarza...</p></div>;
    if (error) return <div className="card error-state"><p>{error}</p>{onBack && <button onClick={onBack}>🔄 Zmień</button>}</div>;

    return (
        <div className={`card ${styles.matchListContainer}`}>
            <TeamHeader team={team} />

            <div className={styles.matchesGrid}>
                <MatchColumn
                    title="Nadchodzące mecze"
                    matches={upcomingMatches}
                    selectedMatches={selectedMatches}
                    onToggleMatch={toggleSelectMatch}
                    onToggleAll={toggleSelectAllUpcoming}
                    isSelectable={true}
                    formatDate={formatDate}
                    isMatchSelected={isMatchSelected}
                />

                <MatchColumn
                    title="Ostatnie mecze"
                    matches={playedMatches}
                    isSelectable={false}
                    formatDate={formatDate}
                />
            </div>

            <div className={styles.submitBtnWrapper}>
                <button
                    onClick={() => onExportSelected && onExportSelected(selectedMatches)}
                    disabled={selectedMatches.length === 0}
                    className={styles.submitBtn}
                >
                    {selectedMatches.length > 0
                        ? `Dodaj wybrane do kalendarza (${selectedMatches.length})`
                        : 'Wybierz mecze do dodania'}
                </button>
            </div>
        </div>
    );
};