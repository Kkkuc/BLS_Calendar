import { useState, useEffect, useMemo } from 'react';
import type { Team } from '../types';
import { apiFetch } from '../services/api.ts';

interface TeamSelectionProps {
    onSelectTeam: (team: Team) => void;
    selectedTeamId?: number | null;
}

export default function TeamSelection({ onSelectTeam, selectedTeamId }: TeamSelectionProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Dodajemy stan wybranej ligi (domyślnie I Liga = 1)
    const [selectedLeague, setSelectedLeague] = useState<number>(1);
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

    // 2. Filtrowanie uwzględniające wybraną ligę (team.league zwracane z backendu) oraz wyszukiwarkę
    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            const matchesLeague = team.league ? team.league === selectedLeague : true;

            const matchesSearch = team.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase().trim());

            return matchesLeague && matchesSearch;
        });
    }, [teams, selectedLeague, searchQuery]);

    const handleTeamClick = (team: Team) => {
        setSelectedTeam(team);
    };

    const handleSubmit = () => {
        if (selectedTeam) {
            onSelectTeam(selectedTeam);
        }
    };

    if (isLoading) {
        return (
            <div className="card loading-state">
                <p>Pobieranie aktywnych drużyn z serwera...</p>
            </div>
        );
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
        <div className="card flashscore-card">

            {/* Przełącznik Lig (Tabs / Przyciski) */}
            <div className="league-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button
                    type="button"
                    className={`submit-btn ${selectedLeague === 1 ? '' : 'secondary-btn'}`}
                    style={{ flex: 1, opacity: selectedLeague === 1 ? 1 : 0.6 }}
                    onClick={() => { setSelectedLeague(1); setSelectedTeam(null); }}
                >
                    I Liga
                </button>
                <button
                    type="button"
                    className={`submit-btn ${selectedLeague === 2 ? '' : 'secondary-btn'}`}
                    style={{ flex: 1, opacity: selectedLeague === 2 ? 1 : 0.6 }}
                    onClick={() => { setSelectedLeague(2); setSelectedTeam(null); }}
                >
                    II Liga
                </button>
            </div>

            {/* Wyszukiwarka */}
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Szukaj drużyny..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                    <div className="empty-state">Brak drużyn w tej lidze dla podanej frazy.</div>
                )}
            </div>

            {/* Przycisk akcji */}
            <div className="action-footer">
                <button
                    type="button"
                    className="submit-btn"
                    disabled={!selectedTeam}
                    onClick={handleSubmit}
                >
                    {selectedTeam ? `Pobierz mecze dla: ${selectedTeam.name}` : 'Wybierz drużynę'}
                </button>
            </div>
        </div>
    );
}