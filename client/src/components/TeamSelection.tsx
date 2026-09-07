import { useState, useEffect, useMemo } from 'react';
import type { Team } from '../types';
import { apiFetch } from '../services/api.ts';

interface TeamSelectionProps {
    onSelectTeam: (team: Team) => void;
    selectedTeamId?: number | null;
}

type CompetitionType = 'league1' | 'league2' | 'cup' | 'cupElim' | 'superCup';

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
                if (!response.ok) {
                    throw new Error(`Błąd serwera HTTP: ${response.status}`);
                }

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

    // Filtrowanie na podstawie wybranej kategorii i flag obiektu Team
    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            let matchesCompetition = false;

            switch (competition) {
                case 'league1':
                    matchesCompetition = team.leagueNum === 1;
                    break;
                case 'league2':
                    matchesCompetition = team.leagueNum === 2;
                    break;
                case 'cup':
                    matchesCompetition = Boolean(team.isInCup);
                    break;
                case 'cupElim':
                    matchesCompetition = Boolean(team.isInCupElim);
                    break;
                case 'superCup':
                    matchesCompetition = Boolean(team.isInSuperCup);
                    break;
            }

            const matchesSearch = team.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase().trim());

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

    // Unikalne emotki dla każdego rodzaju rozgrywek
    const getCompetitionEmoji = (type: CompetitionType) => {
        switch (type) {
            case 'league1': return '🥇';
            case 'league2': return '🥈';
            case 'cup': return '🏆';
            case 'cupElim': return '🎯';
            case 'superCup': return '⭐';
        }
    };

    const handleTeamClick = (team: Team) => {
        setSelectedTeam(team);
    };

    const handleSubmit = () => {
        if (selectedTeam) {
            onSelectTeam(selectedTeam);
        }
    };

    if (isLoading) {
        return <div className="card loading-state"><p>Pobieranie aktywnych drużyn z serwera...</p></div>;
    }

    if (error) {
        return (
            <div className="card error-state">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Spróbuj ponownie</button>
            </div>
        );
    }

    return (
        <div className="card flashscore-card" style={{ position: 'relative' }}>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>

                {/* Kompaktowy przycisk (Dedykowana emotka + Strzałka) */}
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    title={getCompetitionName(competition)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        background: '#1e1e1e',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '1px solid #333',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        height: '100%'
                    }}
                >
                    <span style={{ fontSize: '16px' }}>{getCompetitionEmoji(competition)}</span>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>▼</span>
                </button>

                {/* Wyszukiwarka obok */}
                <div className="search-box" style={{ flex: 1, margin: 0 }}>
                    <input
                        type="text"
                        placeholder="Szukaj drużyny..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Lista drużyn */}
            <div className="team-list">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => {
                        const isSelected = selectedTeam?.id === team.id;
                        return (
                            <div
                                key={team.id}
                                className={`team-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleTeamClick(team)}
                            >
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
                                <div className="team-comment">Kliknij aby wybrać</div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">Brak drużyn w tej kategorii dla podanej frazy.</div>
                )}
            </div>

            {/* Przycisk akcji */}
            <div className="action-footer" style={{ marginTop: '15px' }}>
                <button
                    type="button"
                    className="submit-btn"
                    disabled={!selectedTeam}
                    onClick={handleSubmit}
                >
                    {selectedTeam ? `Pobierz mecze dla: ${selectedTeam.name}` : 'Wybierz drużynę'}
                </button>
            </div>

            {/* Flashscore Style Bottom Sheet / Overlay Menu */}
            {isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#18181b',
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px',
                            padding: '20px',
                            maxHeight: '70vh',
                            overflowY: 'auto',
                            borderTop: '1px solid #333'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Wybierz rozgrywki</h3>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(['league1', 'league2', 'cup', 'cupElim', 'superCup'] as CompetitionType[]).map((type) => {
                                const active = competition === type;
                                return (
                                    <div
                                        key={type}
                                        onClick={() => {
                                            setCompetition(type);
                                            setSelectedTeam(null);
                                            setIsMenuOpen(false);
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            background: active ? '#27272a' : 'transparent',
                                            color: active ? '#3b82f6' : '#e4e4e7',
                                            fontWeight: active ? 600 : 400,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: active ? '1px solid #3f3f46' : '1px solid transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '18px' }}>{getCompetitionEmoji(type)}</span>
                                            <span>{getCompetitionName(type)}</span>
                                        </div>
                                        {active && <span>✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}