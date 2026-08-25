import React, { useEffect, useState } from 'react';
import type { MatchDto } from '../types/match';
import type { Team } from '../types';
import { apiFetch } from '../services/api.ts';

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

    const defaultLogo = "/default-logo.png";

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
                if (!response.ok) {
                    throw new Error('Nie udało się pobrać terminarza meczów.');
                }
                const data: MatchDto[] = await response.json();
                setAllMatches(data);

                const unplayed = data.filter(isUnplayedMatch);
                setSelectedMatches(unplayed);
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
            setSelectedMatches(
                selectedMatches.filter(
                    (m) => !(m.round === match.round && m.host === match.host && m.guest === match.guest)
                )
            );
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

    // Generowanie zewnętrznych linków ligowych
    const profileUrl = `https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=Profile&t_id=${team.id}`;
    const playersUrl = `https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamPlayers&t_id=${team.id}`;
    const scheduleUrl = `https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id=${team.id}`;

    return (
        <div className="card match-list-container">

            {/* 1. GÓRNY KAFELEK: DUŻE LOGO, NAZWA I LINKI DO LIGSPACE */}
            <div className="team-header-card mb-3">
                <img
                    src={team.logoUrl || defaultLogo}
                    alt={team.name}
                    className="team-logo-large"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultLogo;
                    }}
                />

                <div className="team-header-details">
                    <h2 className="team-title-large">{team.name}</h2>

                    <div className="team-external-links">
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="league-link">
                            📋 Profil
                        </a>
                        <a href={playersUrl} target="_blank" rel="noopener noreferrer" className="league-link">
                            👥 Zawodnicy
                        </a>
                        <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" className="league-link">
                            📅 Terminarz
                        </a>
                    </div>
                </div>
            </div>

            {/* 2. DWA KAFELKI SEKCJI (SIATKA 2-KOLUMNOWA) */}
            <div className="matches-grid">

                {/* SEKCJA LEWA: NADCHODZĄCE MECZE */}
                <div className="matches-column">
                    <div className="column-header">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={selectedMatches.length === upcomingMatches.length && upcomingMatches.length > 0}
                                onChange={toggleSelectAllUpcoming}
                                className="accent-checkbox"
                            />
                            <span className="column-title">Nadchodzące mecze</span>
                        </label>
                        <span className="count-badge">({upcomingMatches.length})</span>
                    </div>

                    <div className="scrollable-matches-list">
                        {upcomingMatches.length === 0 ? (
                            <p className="empty-text">Brak nadchodzących meczów.</p>
                        ) : (
                            upcomingMatches.map((match, idx) => {
                                const selected = isMatchSelected(match);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleSelectMatch(match)}
                                        className={`match-card-item ${selected ? 'selected' : ''}`}
                                    >
                                        <div className="match-card-top">
                                            <div className="match-checkbox-group">
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleSelectMatch(match)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="accent-checkbox"
                                                />
                                                <span className="round-badge">Kolejka {match.round}</span>
                                            </div>
                                            <span className="match-date">{formatDate(match.matchDate)}</span>
                                        </div>
                                        <div className="match-teams">
                                            {match.host} – {match.guest}
                                        </div>
                                        <div className="match-court">
                                            📍 {match.court || 'Sektor nieznany'}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* SEKCJA PRAWA: OSTATNIE MECZE */}
                <div className="matches-column">
                    <div className="column-header">
                        <span className="column-title">Ostatnie mecze</span>
                        <span className="count-badge">({playedMatches.length})</span>
                    </div>

                    <div className="scrollable-matches-list">
                        {playedMatches.length === 0 ? (
                            <p className="empty-text">Brak rozegranych meczów.</p>
                        ) : (
                            playedMatches.map((match, idx) => (
                                <div key={idx} className="match-card-item unclickable">
                                    <div className="match-card-top">
                                        <span className="round-badge">Kolejka {match.round}</span>
                                        <span className="match-date">{formatDate(match.matchDate)}</span>
                                    </div>
                                    <div className="match-teams-score">
                                        <span className="truncate pr-2">{match.host} vs {match.guest}</span>
                                        <span className="score-tag">
                                            {match.hostSetsResult} : {match.guestSetsResult}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* 3. DOLNY PRZYCISK NA CAŁĄ SZEROKOŚĆ */}
            <div className="submit-btn-wrapper">
                <button
                    onClick={() => onExportSelected && onExportSelected(selectedMatches)}
                    disabled={selectedMatches.length === 0}
                    className="submit-btn"
                >
                    {selectedMatches.length > 0
                        ? `Dodaj wybrane do kalendarza (${selectedMatches.length})`
                        : 'Wybierz mecze do dodania'}
                </button>
            </div>
        </div>
    );
};