import React, { useEffect, useState } from 'react';
import type { MatchDto } from '../types/match';
import type { Team } from '../types';

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
                const response = await fetch(`/api/teams/${team.id}/matches`);
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

    if (!team) return <div className="p-4 text-center text-gray-500">Wybierz drużynę.</div>;
    if (loading) return <div className="card loading-state"><p>Ładowanie terminarza...</p></div>;
    if (error) return <div className="card error-state"><p>{error}</p>{onBack && <button onClick={onBack}>🔄 Zmień</button>}</div>;

    return (
        <div className="card flex flex-col h-full overflow-hidden">

            {/* 1. KAFELEK GÓRNY: LOGO + NAZWA + COFNIJ */}
            <div className="team-item mb-3 flex-shrink-0">
                <div className="team-info">
                    <img
                        src={team.logoUrl || defaultLogo}
                        alt={team.name}
                        className="team-logo"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultLogo;
                        }}
                    />
                    <span className="team-name">{team.name}</span>
                </div>

                {onBack && (
                    <button
                        onClick={onBack}
                        className="tab-button"
                        style={{ maxWidth: '100px', padding: '6px 12px' }}
                    >
                        ⇐ Cofnij
                    </button>
                )}
            </div>

            {/* 2. DWA KAFELKI SEKCJI: LEWY (NADCHODZĄCE), PRAWY (OSTATNIE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto pr-1 mb-3">

                {/* KAFELEK LEWY: NADCHODZĄCE MECZE */}
                <div className="card flex flex-col min-h-0" style={{ padding: '10px' }}>
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--border-color)] flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedMatches.length === upcomingMatches.length && upcomingMatches.length > 0}
                                onChange={toggleSelectAllUpcoming}
                                className="accent-[var(--accent-color)]"
                            />
                            <h3 className="font-bold text-sm margin-0">Nadchodzące mecze</h3>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">({upcomingMatches.length})</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {upcomingMatches.length === 0 ? (
                            <p className="text-xs text-[var(--text-muted)] py-4 text-center">Brak nadchodzących meczów.</p>
                        ) : (
                            upcomingMatches.map((match, idx) => {
                                const selected = isMatchSelected(match);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleSelectMatch(match)}
                                        className={`team-item cursor-pointer flex-col align-stretch ${selected ? 'selected' : ''}`}
                                        style={{ minHeight: 'auto', padding: '10px' }}
                                    >
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleSelectMatch(match)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="accent-[var(--accent-color)]"
                                                />
                                                <span className="font-semibold">Kolejka {match.round}</span>
                                            </div>
                                            <span className="text-[var(--text-muted)]">{formatDate(match.matchDate)}</span>
                                        </div>
                                        <div className="text-xs font-semibold my-1 pl-5">
                                            {match.host} - {match.guest}
                                        </div>
                                        <div className="text-[11px] text-[var(--text-muted)] pl-5">
                                            📍 {match.court || 'Sektor nieznany'}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* KAFELEK PRAWY: OSTATNIE MECZE */}
                <div className="card flex flex-col min-h-0" style={{ padding: '10px' }}>
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--border-color)] flex-shrink-0">
                        <h3 className="font-bold text-sm margin-0">Ostatnie mecze</h3>
                        <span className="text-xs text-[var(--text-muted)]">({playedMatches.length})</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {playedMatches.length === 0 ? (
                            <p className="text-xs text-[var(--text-muted)] py-4 text-center">Brak rozegranych meczów.</p>
                        ) : (
                            playedMatches.map((match, idx) => (
                                <div
                                    key={idx}
                                    className="team-item flex-col align-stretch"
                                    style={{ minHeight: 'auto', padding: '10px', cursor: 'default' }}
                                >
                                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                                        <span>Kolejka {match.round}</span>
                                        <span>{formatDate(match.matchDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-semibold">
                                        <span>{match.host} vs {match.guest}</span>
                                        <span className="tab-button active" style={{ padding: '2px 8px', fontSize: '11px', flex: 'none' }}>
                                            {match.hostSetsResult} : {match.guestSetsResult}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* 3. KAFELEK DOLNY: PRZYCISK EKSPORTU NA CAŁĄ SZEROKOŚĆ */}
            <div className="flex-shrink-0">
                <button
                    onClick={() => onExportSelected && onExportSelected(selectedMatches)}
                    disabled={selectedMatches.length === 0}
                    className="submit-btn text-sm py-3 w-full font-bold"
                >
                    {selectedMatches.length > 0
                        ? `Dodaj wybrane do kalendarza (${selectedMatches.length})`
                        : 'Wybierz mecze do dodania'}
                </button>
            </div>
        </div>
    );
};